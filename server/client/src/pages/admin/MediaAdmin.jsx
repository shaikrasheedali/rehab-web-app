import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import AdminLayout from './AdminLayout.jsx';
import RichTextEditor from '../../components/common/RichTextEditor.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';
import { fmtDate, currentISODate, cn } from '../../utils/formatters.js';

export default function MediaAdmin() {
  const { mediaItems, notify, fetchMedia } = useApp();
  const [sectionFilter, setSectionFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filtered = mediaItems.filter(item => {
    if (sectionFilter === 'all') return true;
    return item.section === sectionFilter;
  });

  const openItem = (item) => {
    if (item) {
      setEditing({
        ...item,
        images: Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : item.image
          ? [item.image]
          : []
      });
    } else {
      setEditing({
        title: '',
        section: 'blog',
        subtype: 'blog-post',
        author: 'Sri Thirumala Care Team',
        excerpt: '',
        content: '<h2>Article Heading</h2><p>Share clinical rehabilitation insights and advice here.</p>',
        image: '',
        images: [],
        caption: '',
        mediaUrl: '',
        publishedAt: currentISODate(),
        active: true
      });
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const response = await api.uploadMultipleFiles(files, 'blogs');
      const newUrls = (response.files || []).map(f => f.url);
      setEditing(prev => {
        const updatedImages = [...(prev.images || []), ...newUrls];
        return {
          ...prev,
          images: updatedImages,
          image: prev.image || updatedImages[0] || ''
        };
      });
      notify(`${newUrls.length} image(s) uploaded successfully.`);
    } catch (err) {
      notify(err.message || 'Failed to upload images', 'warning');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setEditing(prev => {
      const updated = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        image: updated[0] || ''
      };
    });
  };

  const setCoverImage = (url) => {
    setEditing(prev => ({
      ...prev,
      image: url
    }));
    notify('Cover photo updated.');
  };

  const saveItem = async () => {
    if (!editing.title.trim()) {
      notify('Please enter a title.', 'warning');
      return;
    }

    const imagesList = Array.isArray(editing.images) ? editing.images : [];
    const mainImage = editing.image || imagesList[0] || '';

    setSubmitting(true);
    try {
      const payload = {
        ...editing,
        title: editing.title.trim(),
        author: editing.author?.trim() || 'Sri Thirumala Care Team',
        images: imagesList,
        image: mainImage
      };

      if (editing.id) {
        await api.updateMediaItem(editing.id, payload);
        notify(`Media "${payload.title}" updated.`);
      } else {
        await api.createMediaItem(payload);
        notify(`Media "${payload.title}" published.`);
      }

      setEditing(null);
      fetchMedia();
    } catch (err) {
      notify(err.message || 'Failed to save media', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.deleteMediaItem(item.id);
      notify(`"${item.title}" deleted.`);
      fetchMedia();
    } catch (err) {
      notify(err.message || 'Failed to delete media', 'warning');
    }
  };

  return (
    <AdminLayout
      title="Gallery & Clinical Blog Management"
      subtitle="Publish and upload photos, clinical articles, patient testimonials, and social reels"
      action={
        <button className="btn-primary mobile-hide !py-2 text-xs cursor-pointer" onClick={() => openItem(null)}>
          <Icon name="plus" size={14} /> New Publication
        </button>
      }
    >
      {/* Section Filter Pills */}
      <div className="flex flex-wrap rounded-full bg-[var(--surface)] border border-ui p-1 mb-6 w-fit">
        {[
          ['all', 'All Media'],
          ['blog', 'Clinical Blog'],
          ['testimonial', 'Testimonials'],
          ['post', 'Gallery & Social Posts']
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSectionFilter(val)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer',
              sectionFilter === val
                ? 'bg-[var(--teal)] text-white shadow-sm'
                : 'text-muted hover:text-main'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid of Media Items */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(item => (
          <article
            key={item.id}
            className="card overflow-hidden bg-[var(--surface)] shadow-sm flex flex-col justify-between interactive-card"
          >
            <div>
              <div className="h-44 overflow-hidden relative bg-[var(--mist)]">
                {item.image ? (
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted">
                    <Icon name="image" size={36} />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 text-[var(--teal)] rounded-full px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm">
                  {item.subtype}
                </span>
              </div>

              <div className="p-5">
                <div className="text-[10px] text-muted font-mono uppercase">
                  {fmtDate(item.publishedAt)} · {item.author}
                </div>
                <h3 className="font-display font-extrabold text-lg text-main mt-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                  {item.excerpt || item.caption}
                </p>
                <div className="text-[10px] text-muted mt-3">
                  {(item.images || []).length} uploaded image(s)
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-ui flex justify-between items-center bg-[var(--mist)]/20">
              <span className={cn('text-xs font-bold', item.active ? 'text-emerald-600' : 'text-muted')}>
                {item.active ? '● Published' : '○ Draft'}
              </span>
              <div className="flex gap-2">
                <button
                  className="icon-btn !w-8 !h-8"
                  onClick={() => openItem(item)}
                  title={`Edit ${item.title}`}
                >
                  <Icon name="pencil" size={14} />
                </button>
                <button
                  className="icon-btn !w-8 !h-8 text-red-500 hover:bg-red-50"
                  onClick={() => removeItem(item)}
                  title={`Delete ${item.title}`}
                >
                  <Icon name="trash-2" size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Media Editor Modal */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div
            className="card max-w-4xl w-full p-5 lg:p-8 max-h-[92vh] overflow-y-auto bg-[var(--surface)] shadow-soft animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="eyebrow">Publication & Media Editor</span>
                <h2 className="font-display font-extrabold text-2xl text-main mt-1">
                  {editing.id ? `Edit ${editing.title}` : 'Create Publication'}
                </h2>
              </div>
              <button className="icon-btn" onClick={() => setEditing(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <label className="block sm:col-span-2">
                <span className="block text-xs font-bold text-main mb-1.5">Headline / Title *</span>
                <input
                  required
                  className="input text-sm"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="e.g. Navigating Stroke Rehabilitation in First 90 Days"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Section</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={editing.section}
                  onChange={(e) => setEditing({ ...editing, section: e.target.value })}
                >
                  <option value="blog">Clinical Blog Article</option>
                  <option value="testimonial">Family Video Testimonial</option>
                  <option value="post">Gallery / Social Post</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Subtype</span>
                <select
                  className="input text-sm cursor-pointer"
                  value={editing.subtype}
                  onChange={(e) => setEditing({ ...editing, subtype: e.target.value })}
                >
                  <option value="blog-post">Blog Post</option>
                  <option value="testimonial-video">Testimonial Video</option>
                  <option value="youtube-video">YouTube Video</option>
                  <option value="instagram-reel">Instagram Reel</option>
                  <option value="instagram-post">Instagram Post</option>
                  <option value="facebook-reel">Facebook Reel</option>
                  <option value="facebook-post">Facebook Post</option>
                  <option value="x-post">X Post</option>
                  <option value="image">Standalone Image</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Author / Speaker</span>
                <input
                  className="input text-sm"
                  value={editing.author}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Publish Date</span>
                <input
                  type="date"
                  className="input text-sm"
                  value={editing.publishedAt?.slice(0, 10) || currentISODate()}
                  onChange={(e) => setEditing({ ...editing, publishedAt: e.target.value })}
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Excerpt / Summary</span>
                <textarea
                  rows={2}
                  className="input resize-none text-sm"
                  value={editing.excerpt || ''}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Short introductory summary for card previews…"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">External Video URL (Optional)</span>
                <input
                  type="url"
                  className="input text-sm"
                  value={editing.mediaUrl || ''}
                  onChange={(e) => setEditing({ ...editing, mediaUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or reel URL"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-main mb-1.5">Image Caption</span>
                <input
                  className="input text-sm"
                  value={editing.caption || ''}
                  onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                  placeholder="e.g. Physiotherapy gym session at Prakash Nagar"
                />
              </label>
            </div>

            {/* Direct Upload & Image Gallery Management */}
            <div className="mt-5 border border-ui rounded-2xl p-5 bg-[var(--mist)]">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                <div>
                  <span className="block text-xs font-bold text-main">Upload Photos & Visuals</span>
                  <span className="text-[11px] text-muted">Upload directly from device (JPG, PNG, WebP)</span>
                </div>
                <label className="btn-primary !py-2 text-xs cursor-pointer">
                  <Icon name="upload-cloud" size={16} />
                  <span>{uploading ? 'Uploading…' : 'Upload Images'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Uploaded Thumbnails Preview */}
              {(editing.images || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {(editing.images || []).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'relative rounded-xl overflow-hidden group border-2 aspect-[4/3] bg-white shadow-sm',
                        editing.image === imgUrl ? 'border-[var(--teal)] ring-2 ring-[#0f5d5e]' : 'border-ui'
                      )}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      {editing.image === imgUrl && (
                        <span className="absolute top-1.5 left-1.5 bg-[var(--teal)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        {editing.image !== imgUrl && (
                          <button
                            type="button"
                            className="text-[10px] bg-white text-slate-800 font-bold px-2 py-1 rounded shadow cursor-pointer"
                            onClick={() => setCoverImage(imgUrl)}
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          className="w-7 h-7 rounded-full bg-red-600 text-white grid place-items-center cursor-pointer shadow"
                          onClick={() => removeImage(idx)}
                          title="Remove image"
                        >
                          <Icon name="trash-2" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editing.section === 'blog' && (
              <div className="mt-5">
                <RichTextEditor
                  value={editing.content}
                  onChange={(html) => setEditing({ ...editing, content: html })}
                  label="Article Content (WYSIWYG Rich Text)"
                />
              </div>
            )}

            <div className="mt-7 flex justify-end gap-3 border-t border-ui pt-4">
              <button className="btn-secondary text-xs cursor-pointer" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                disabled={submitting}
                className="btn-primary text-xs cursor-pointer"
                onClick={saveItem}
              >
                {submitting ? 'Saving…' : 'Save & Publish Publication'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
