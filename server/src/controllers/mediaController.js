import { prisma } from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { parseJsonSafe } from '../utils/dateUtils.js';
import { sanitizeHtml, cleanPlainText } from '../utils/sanitize.js';

export const getAllMediaItems = async (req, res, next) => {
  try {
    const { section, active, search } = req.query;
    const where = {};
    if (section && section !== 'all') where.section = section;
    if (active !== undefined) where.active = active === 'true';

    const items = await prisma.mediaItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' }
    });

    let parsed = items.map(m => ({
      ...m,
      images: parseJsonSafe(m.images, [])
    }));

    if (search) {
      const q = search.toLowerCase();
      parsed = parsed.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.excerpt && m.excerpt.toLowerCase().includes(q)) ||
        (m.author && m.author.toLowerCase().includes(q)) ||
        (m.caption && m.caption.toLowerCase().includes(q))
      );
    }

    return successResponse(res, parsed, 'Media items retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getMediaItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.mediaItem.findUnique({ where: { id } });
    if (!item) {
      return errorResponse(res, `Media item not found with id: ${id}`, 404);
    }
    const parsed = {
      ...item,
      images: parseJsonSafe(item.images, [])
    };
    return successResponse(res, parsed, 'Media item retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createMediaItem = async (req, res, next) => {
  try {
    const {
      id,
      section,
      subtype,
      title,
      excerpt,
      caption,
      content,
      mediaUrl,
      image,
      images,
      author,
      publishedAt,
      active
    } = req.body;

    const cleanTitle = cleanPlainText(title);
    const cleanAuthor = cleanPlainText(author);

    if (!cleanTitle || !cleanAuthor || !section) {
      return errorResponse(res, 'Title, author, and section are required', 400);
    }

    const imagesList = Array.isArray(images) ? images : (image ? [image] : []);
    const mediaId = id || `media-${Date.now()}`;

    const newItem = await prisma.mediaItem.create({
      data: {
        id: mediaId,
        section: section || 'blog',
        subtype: subtype || (section === 'blog' ? 'article' : section === 'testimonial' ? 'testimonial-video' : 'image'),
        title: cleanTitle,
        excerpt: excerpt ? cleanPlainText(excerpt) : null,
        caption: caption ? cleanPlainText(caption) : null,
        content: sanitizeHtml(content || '<p></p>'),
        mediaUrl: mediaUrl ? cleanPlainText(mediaUrl) : null,
        image: image || (imagesList[0] || null),
        images: JSON.stringify(imagesList),
        author: cleanAuthor,
        publishedAt: publishedAt || new Date().toISOString().slice(0, 10),
        active: active !== undefined ? Boolean(active) : true
      }
    });

    const parsed = {
      ...newItem,
      images: parseJsonSafe(newItem.images, [])
    };

    return successResponse(res, parsed, 'Media item created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateMediaItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      section,
      subtype,
      title,
      excerpt,
      caption,
      content,
      mediaUrl,
      image,
      images,
      author,
      publishedAt,
      active
    } = req.body;

    const existing = await prisma.mediaItem.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Media item not found with id: ${id}`, 404);
    }

    const imagesList = Array.isArray(images)
      ? images
      : (image ? [image] : parseJsonSafe(existing.images, []));

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: {
        ...(section && { section }),
        ...(subtype && { subtype }),
        ...(title && { title: cleanPlainText(title) }),
        ...(excerpt !== undefined && { excerpt: cleanPlainText(excerpt) }),
        ...(caption !== undefined && { caption: cleanPlainText(caption) }),
        ...(content !== undefined && { content: sanitizeHtml(content) }),
        ...(mediaUrl !== undefined && { mediaUrl: cleanPlainText(mediaUrl) }),
        ...(image !== undefined && { image }),
        ...(images !== undefined && { images: JSON.stringify(imagesList) }),
        ...(author && { author: cleanPlainText(author) }),
        ...(publishedAt && { publishedAt }),
        ...(active !== undefined && { active: Boolean(active) })
      }
    });

    const parsed = {
      ...updated,
      images: parseJsonSafe(updated.images, [])
    };

    return successResponse(res, parsed, 'Media item updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteMediaItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.mediaItem.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, `Media item not found with id: ${id}`, 404);
    }

    await prisma.mediaItem.delete({ where: { id } });
    return successResponse(res, { id }, 'Media item deleted successfully');
  } catch (err) {
    next(err);
  }
};
