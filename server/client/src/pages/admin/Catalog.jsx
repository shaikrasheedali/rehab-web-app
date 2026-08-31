import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import RichTextEditor from '../../components/common/RichTextEditor.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { money, cn } from '../../utils/formatters.js';

export default function Catalog() {
  const {
    services,
    packages,
    notify,
    fetchServices,
    fetchPackages
  } = useApp();

  const [tab, setTab] = useState('services');
  const [q, setQ] = useState('');
  const [serviceEdit, setServiceEdit] = useState(null);
  const [packageEdit, setPackageEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const serviceResults = useMemo(() => {
    if (!q) return services;
    const fuse = new Fuse(services, {
      keys: ['name', 'kind', 'summary', 'benefits'],
      threshold: 0.35
    });
    return fuse.search(q).map(x => x.item);
  }, [services, q]);

  const packageResults = useMemo(() => {
    if (!q) return packages;
    const fuse = new Fuse(packages, {
      keys: ['name', 'benefits'],
      threshold: 0.35
    });
    return fuse.search(q).map(x => x.item);
  }, [packages, q]);

  const openService = (item) => {
    if (item) {
      setServiceEdit({
        ...item,
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [],
        benefitsText: (item.benefits || []).join(', ')
      });
    } else {
      setServiceEdit({
        name: '',
        kind: 'in-package',
        rate: 1000,
        summary: '',
        content: '<h2>About this clinical service</h2><p>Describe clinical goals, daily protocols, and patient benefits.</p>',
        benefitsText: 'Guided daily sessions, Clinical mobility assessment',
        images: [],
        active: true
      });
    }
  };

  const uploadServiceImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const response = await api.uploadMultipleFiles(files, 'services');
      const uploadedUrls = (response.files || []).map(f => f.url);
      setServiceEdit(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));
      notify(`${uploadedUrls.length} image(s) uploaded.`);
    } catch (err) {
      notify(err.message || 'Failed to upload images', 'warning');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeServiceImage = (idxToRemove) => {
    setServiceEdit(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const saveService = async () => {
    const name = serviceEdit.name?.trim();
    const summary = serviceEdit.summary?.trim();
    const images = Array.isArray(serviceEdit.images) ? serviceEdit.images : [];

    if (!name || !summary || Number(serviceEdit.rate) < 0) {
      notify('Please provide service name, summary, and rate.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        kind: serviceEdit.kind || 'in-package',
        rate: Number(serviceEdit.rate),
        summary,
        content: serviceEdit.content,
        benefits: (serviceEdit.benefitsText || '')
          .split(',')
          .map(x => x.trim())
          .filter(Boolean),
        images,
        active: serviceEdit.active !== undefined ? Boolean(serviceEdit.active) : true
      };

      if (serviceEdit.id) {
        await api.updateService(serviceEdit.id, payload);
        notify(`Service ${name} updated.`);
      } else {
        await api.createService(payload);
        notify(`Service ${name} created.`);
      }

      setServiceEdit(null);
      fetchServices();
    } catch (err) {
      notify(err.message || 'Failed to save service', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const removeService = async (item) => {
    if (!window.confirm(`Delete service ${item.name}?`)) return;
    try {
      await api.deleteService(item.id);
      notify(`Service ${item.name} removed.`);
      fetchServices();
      fetchPackages();
    } catch (err) {
      notify(err.message || 'Failed to delete service', 'warning');
    }
  };

  const openPackage = (item) => {
    if (item) {
      setPackageEdit({
        ...item,
        benefitsText: (item.benefits || []).join(', ')
      });
    } else {
      setPackageEdit({
        name: '',
        rate: 4500,
        serviceIds: [],
        benefitsText: 'Coordinated care plan, Weekly family briefing',
        active: true
      });
    }
  };

  const toggleIncludedService = (id) => {
    setPackageEdit(p => ({
      ...p,
      serviceIds: (p.serviceIds || []).includes(id)
        ? p.serviceIds.filter(x => x !== id)
        : [...(p.serviceIds || []), id]
    }));
  };

  const savePackage = async () => {
    const name = packageEdit.name?.trim();
    if (!name || Number(packageEdit.rate) < 0) {
      notify('Please enter a package name and valid daily rate.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        rate: Number(packageEdit.rate),
        serviceIds: packageEdit.serviceIds || [],
        benefits: (packageEdit.benefitsText || '')
          .split(',')
          .map(x => x.trim())
          .filter(Boolean),
        active: packageEdit.active !== undefined ? Boolean(packageEdit.active) : true
      };

      if (packageEdit.id) {
        await api.updatePackage(packageEdit.id, payload);
        notify(`Package ${name} updated.`);
      } else {
        await api.createPackage(payload);
        notify(`Package ${name} created.`);
      }

      setPackageEdit(null);
      fetchPackages();
    } catch (err) {
      notify(err.message || 'Failed to save package', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const removePackage = async (item) => {
    if (!window.confirm(`Delete package ${item.name}?`)) return;
    try {
      await api.deletePackage(item.id);
      notify(`Package ${item.name} removed.`);
      fetchPackages();
    } catch (err) {
      notify(err.message || 'Failed to delete package', 'warning');
    }
  };

  return (
    <AdminLayout
      title="Clinical Catalog & Packages"
      subtitle="Complete control of public service cards, image galleries, WYSIWYG clinical guides, and package bundles"
      action={
        <button
          className="btn-primary mobile-hide !py-2 text-xs cursor-pointer"
          onClick={() => (tab === 'services' ? openService() : openPackage())}
        >
          <Icon name="plus" size={14} /> Add {tab === 'services' ? 'Service' : 'Package'}
        </button>
      }
    >
      {/* Metric Highlights */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">In-package Services</span>
          <strong className="block text-3xl font-display font-extrabold text-main mt-1">
            {services.filter(x => x.kind === 'in-package').length}
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Add-on Services</span>
          <strong className="block text-3xl font-display font-extrabold text-blue-600 mt-1">
            {services.filter(x => x.kind === 'off-package').length}
          </strong>
        </div>
        <div className="card p-5 bg-[var(--surface)] shadow-sm">
          <span className="text-xs text-muted font-semibold">Care Packages</span>
          <strong className="block text-3xl font-display font-extrabold text-[var(--teal)] mt-1">
            {packages.length}
          </strong>
        </div>
      </div>

      {/* Catalog Workspace */}
      <section className="card overflow-hidden bg-[var(--surface)] shadow-sm">
        <div className="p-4 border-b border-ui flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="flex rounded-full bg-[var(--mist)] p-1 w-fit">
            <button
              onClick={() => setTab('services')}
              className={cn(
                'rounded-full px-5 py-2 text-xs font-bold transition cursor-pointer',
                tab === 'services' ? 'bg-[var(--surface)] shadow-sm text-[var(--teal)]' : 'text-muted'
              )}
            >
              Services & Add-ons ({services.length})
            </button>
            <button
              onClick={() => setTab('packages')}
              className={cn(
                'rounded-full px-5 py-2 text-xs font-bold transition cursor-pointer',
                tab === 'packages' ? 'bg-[var(--surface)] shadow-sm text-[var(--teal)]' : 'text-muted'
              )}
            >
              Care Packages ({packages.length})
            </button>
          </div>

          <label className="relative md:w-80 w-full">
            <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-10 !py-2 text-xs"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${tab}…`}
            />
          </label>
        </div>

        {/* Services Tab Cards */}
        {tab === 'services' && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {serviceResults.map((item) => (
              <article
                key={item.id}
                className="border border-ui rounded-3xl overflow-hidden bg-[var(--surface)] flex flex-col justify-between interactive-card"
              >
                <div>
                  <div className="h-44 overflow-hidden relative bg-[var(--mist)]">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted">
                        <Icon name="image" size={36} />
                      </div>
                    )}
                    <span
                      className={cn(
                        'absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold rounded-full px-2.5 py-1 shadow-sm',
                        item.kind === 'in-package' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      )}
                    >
                      {item.kind}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-extrabold text-lg text-main">{item.name}</h3>
                      <strong className="text-[var(--teal)] font-mono text-sm whitespace-nowrap">
                        {money(item.rate)}
                        <small className="block text-[9px] text-muted text-right font-normal">/ day</small>
                      </strong>
                    </div>

                    <p className="text-xs text-muted mt-2.5 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="mt-4 text-[10px] text-muted font-medium">
                      {(item.images || []).length} images · {(item.benefits || []).length} benefits
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-ui flex justify-between items-center bg-[var(--mist)]/30">
                  <span className={cn('text-xs font-bold', item.active ? 'text-emerald-600' : 'text-muted')}>
                    {item.active ? '● Published' : '○ Hidden'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="icon-btn !w-8 !h-8"
                      onClick={() => openService(item)}
                      title={`Edit ${item.name}`}
                    >
                      <Icon name="pencil" size={14} />
                    </button>
                    <button
                      className="icon-btn !w-8 !h-8 text-red-500 hover:bg-red-50"
                      onClick={() => removeService(item)}
                      title={`Delete ${item.name}`}
                    >
                      <Icon name="trash-2" size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Packages Tab Cards */}
        {tab === 'packages' && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {packageResults.map((item) => (
              <article
                key={item.id}
                className="border border-ui rounded-3xl p-6 bg-[var(--surface)] flex flex-col justify-between interactive-card"
              >
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--teal)] block">
                        Care Package
                      </span>
                      <h3 className="font-display font-extrabold text-xl text-main mt-1">{item.name}</h3>
                    </div>
                    <strong className="text-[var(--teal)] font-mono text-base whitespace-nowrap">
                      {money(item.rate)}
                      <small className="block text-[9px] text-muted text-right font-normal">/ day</small>
                    </strong>
                  </div>

                  <div className="mt-5 bg-[var(--mist)] rounded-2xl p-4 border border-ui">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-2">
                      Included Services ({(item.serviceIds || []).length})
                    </span>
                    <div className="grid gap-1.5">
                      {(item.serviceIds || []).map((id) => {
                        const svc = services.find(x => x.id === id);
                        return (
                          svc && (
                            <span key={id} className="text-xs text-main flex items-center gap-1.5">
                              <Icon name="check-circle" size={13} className="text-emerald-600 shrink-0" />
                              <span>{svc.name}</span>
                            </span>
                          )
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-ui mt-6 pt-4 flex justify-between items-center">
                  <span className={cn('text-xs font-bold', item.active ? 'text-emerald-600' : 'text-muted')}>
                    {item.active ? '● Published' : '○ Hidden'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="icon-btn !w-8 !h-8"
                      onClick={() => openPackage(item)}
                      title={`Edit ${item.name}`}
                    >
                      <Icon name="pencil" size={14} />
                    </button>
                    <button
                      className="icon-btn !w-8 !h-8 text-red-500 hover:bg-red-50"
                      onClick={() => removePackage(item)}
                      title={`Delete ${item.name}`}
                    >
                      <Icon name="trash-2" size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Service Editor Modal */}
      {serviceEdit && (
        <div className="modal-backdrop" onClick={() => setServiceEdit(null)}>
          <div
            className="card max-w-4xl w-full p-5 lg:p-8 max-h-[92vh] overflow-y-auto bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="eyebrow">Service Catalog Editor</span>
                <h2 className="font-display font-extrabold text-2xl text-main mt-1">
                  {serviceEdit.id ? `Edit ${serviceEdit.name}` : 'Create New Service'}
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setServiceEdit(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Service Name *</span>
                <input
                  required
                  className="input text-sm"
                  value={serviceEdit.name}
                  onChange={(e) => setServiceEdit({ ...serviceEdit, name: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Classification</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={serviceEdit.kind}
                  onChange={(e) => setServiceEdit({ ...serviceEdit, kind: e.target.value })}
                >
                  <option value="in-package">In-package service (Package bundle)</option>
                  <option value="off-package">Off-package add-on (Daily flexible)</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Daily Standalone Rate (₹) *</span>
                <input
                  type="number"
                  min="0"
                  className="input text-sm font-mono"
                  value={serviceEdit.rate}
                  onChange={(e) => setServiceEdit({ ...serviceEdit, rate: Number(e.target.value) })}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Public Visibility</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={String(serviceEdit.active)}
                  onChange={(e) => setServiceEdit({ ...serviceEdit, active: e.target.value === 'true' })}
                >
                  <option value="true">Published</option>
                  <option value="false">Hidden / Draft</option>
                </select>
              </label>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Card Excerpt / Summary *</span>
                <textarea
                  rows={2}
                  className="input resize-none text-sm"
                  value={serviceEdit.summary}
                  onChange={(e) => setServiceEdit({ ...serviceEdit, summary: e.target.value })}
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Key Deliverables (Comma-separated)</span>
                <textarea
                  rows={2}
                  className="input resize-none text-sm"
                  value={serviceEdit.benefitsText}
                  onChange={(e) => setServiceEdit({ ...serviceEdit, benefitsText: e.target.value })}
                />
              </label>
            </div>

            {/* Direct Photo Uploading */}
            <div className="mt-5 border border-ui rounded-2xl p-5 bg-[var(--mist)]">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                <div>
                  <span className="block text-xs font-bold text-main">Service Gallery Photos</span>
                  <span className="text-[11px] text-muted">Upload real photographs from device</span>
                </div>
                <label className="btn-primary !py-2 text-xs cursor-pointer">
                  <Icon name="upload-cloud" size={16} />
                  <span>{uploading ? 'Uploading…' : 'Upload Images'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={uploadServiceImages}
                  />
                </label>
              </div>

              {(serviceEdit.images || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {(serviceEdit.images || []).map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden group border border-ui aspect-[4/3] bg-white shadow-sm">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white grid place-items-center cursor-pointer shadow opacity-0 group-hover:opacity-100 transition"
                        onClick={() => removeServiceImage(idx)}
                        title="Remove photo"
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <RichTextEditor
                value={serviceEdit.content}
                onChange={(html) => setServiceEdit({ ...serviceEdit, content: html })}
                label="Comprehensive Clinical Service Description (WYSIWYG)"
              />
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-ui pt-4">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setServiceEdit(null)}>
                Cancel
              </button>
              <button
                disabled={submitting}
                className="btn-primary text-xs cursor-pointer"
                onClick={saveService}
              >
                {submitting ? 'Saving…' : 'Save & Publish Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Editor Modal */}
      {packageEdit && (
        <div className="modal-backdrop" onClick={() => setPackageEdit(null)}>
          <div
            className="card max-w-2xl w-full p-7 bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="eyebrow">Care Package Editor</span>
                <h2 className="font-display font-extrabold text-2xl text-main mt-1">
                  {packageEdit.id ? `Edit ${packageEdit.name}` : 'Create Care Package'}
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setPackageEdit(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Package Name *</span>
                <input
                  required
                  className="input text-sm"
                  value={packageEdit.name}
                  onChange={(e) => setPackageEdit({ ...packageEdit, name: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Daily Package Rate (₹) *</span>
                <input
                  type="number"
                  min="0"
                  className="input text-sm font-mono"
                  value={packageEdit.rate}
                  onChange={(e) => setPackageEdit({ ...packageEdit, rate: Number(e.target.value) })}
                />
              </label>
            </div>

            <div className="mt-5">
              <span className="block text-xs font-bold text-main mb-2">Bundled In-package Services</span>
              <div className="grid sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 border border-ui rounded-xl bg-[var(--mist)]">
                {services
                  .filter(x => x.kind === 'in-package' && x.active)
                  .map(svc => (
                    <label
                      key={svc.id}
                      className={cn(
                        'border rounded-xl p-3 flex gap-2.5 items-start cursor-pointer text-xs transition bg-[var(--surface)]',
                        (packageEdit.serviceIds || []).includes(svc.id)
                          ? 'border-[var(--teal)] ring-1 ring-[#0f5d5e]'
                          : 'border-ui'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={(packageEdit.serviceIds || []).includes(svc.id)}
                        onChange={() => toggleIncludedService(svc.id)}
                        className="accent-[#0f5d5e] cursor-pointer mt-0.5"
                      />
                      <div>
                        <strong className="block text-main">{svc.name}</strong>
                        <span className="text-muted">{money(svc.rate)} standalone value</span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Package Highlights (Comma-separated)</span>
                <textarea
                  rows={3}
                  className="input resize-none text-sm"
                  value={packageEdit.benefitsText}
                  onChange={(e) => setPackageEdit({ ...packageEdit, benefitsText: e.target.value })}
                />
              </label>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-ui pt-4">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setPackageEdit(null)}>
                Cancel
              </button>
              <button
                disabled={submitting}
                className="btn-primary text-xs cursor-pointer"
                onClick={savePackage}
              >
                {submitting ? 'Saving…' : 'Save Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
