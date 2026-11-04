// src/services/documentService.ts
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';
import { VerificationDocument, UploadedFileItem } from '../types/restaurant';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];
export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const BUCKET_NAME = 'restaurant-documents';

/**
 * Format bytes to human readable string (e.g. "1.4 MB", "850 KB")
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format upload timestamp (e.g. "Today, 10:24 AM" or formatted date)
 */
export function formatUploadTimestamp(date: Date = new Date()): string {
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `Today, ${time}`;
}

/**
 * Validate file type and size
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the maximum allowed size of 10 MB (${formatFileSize(file.size)})`,
    };
  }

  // Extension & mime check
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || file.type === '';

  if (!isValidExt && !isValidMime) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported format. Please upload PDF, JPG, JPEG, or PNG.`,
    };
  }

  return { valid: true };
}

/**
 * Upload single document to Supabase Storage 'restaurant-documents' bucket
 */
export async function uploadDocumentToStorage(
  restaurantId: string,
  docId: string,
  file: File,
  label?: string
): Promise<{
  success: boolean;
  uploadedItem?: UploadedFileItem;
  error?: string;
}> {
  const validation = validateDocumentFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const client = getSupabaseClient();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${restaurantId}/${docId}/${timestamp}_${cleanFileName}`;

  // Create local blob URL for instant, zero-delay preview
  const localBlobUrl = URL.createObjectURL(file);
  let finalPreviewUrl = localBlobUrl;
  let remotePath = storagePath;

  if (client && isSupabaseConfigured()) {
    try {
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadErr } = await client.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadErr) {
        // If bucket not found, attempt to create
        if (uploadErr.message?.toLowerCase().includes('bucket not found')) {
          await client.storage.createBucket(BUCKET_NAME, { public: false });
          await client.storage.from(BUCKET_NAME).upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          });
        } else {
          console.warn('Supabase storage upload notice:', uploadErr.message);
        }
      }

      // 2. Obtain signed URL for private bucket (valid 24h)
      const { data: signedData } = await client.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, 86400);

      if (signedData?.signedUrl) {
        finalPreviewUrl = signedData.signedUrl;
      }

      // 3. Save/Upsert metadata into restaurant_documents table
      await client
        .from('restaurant_documents')
        .upsert(
          {
            restaurant_id: restaurantId,
            doc_type: docId,
            file_name: file.name,
            file_size: formatFileSize(file.size),
            file_path: storagePath,
            file_url: finalPreviewUrl,
            mime_type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
            status: 'UPLOADED',
            uploaded_at: new Date().toISOString(),
          },
          { onConflict: 'restaurant_id,doc_type' }
        )
        .then(() => {})
        .catch((err) => {
          console.warn('Metadata table upsert notice:', err?.message);
        });
    } catch (err: any) {
      console.warn('Supabase document integration note:', err?.message);
    }
  }

  const uploadedItem: UploadedFileItem = {
    name: file.name,
    size: formatFileSize(file.size),
    url: finalPreviewUrl,
    path: remotePath,
    mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
    label: label,
  };

  return { success: true, uploadedItem };
}

/**
 * Upload multiple images for Restaurant Photos (Kitchen & Facade)
 */
export async function uploadMultipleRestaurantPhotos(
  restaurantId: string,
  docId: string,
  files: File[]
): Promise<{
  success: boolean;
  uploadedItems?: UploadedFileItem[];
  error?: string;
}> {
  if (!files || files.length === 0) {
    return { success: false, error: 'No files provided' };
  }

  // Validate all files
  for (const f of files) {
    const v = validateDocumentFile(f);
    if (!v.valid) return { success: false, error: v.error };
  }

  const uploadedItems: UploadedFileItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    // Label kitchen vs facade if possible
    let label = 'Photo ' + (i + 1);
    const lower = f.name.toLowerCase();
    if (lower.includes('kitchen')) label = 'Kitchen Hygiene';
    else if (lower.includes('facade') || lower.includes('signboard') || lower.includes('front')) label = 'Restaurant Facade';
    else if (i === 0) label = 'Kitchen Hygiene';
    else if (i === 1) label = 'Restaurant Facade';

    const res = await uploadDocumentToStorage(restaurantId, docId, f, label);
    if (res.success && res.uploadedItem) {
      uploadedItems.push(res.uploadedItem);
    }
  }

  return { success: true, uploadedItems };
}

/**
 * Save documents to localStorage for persistence across reloads
 */
export function saveDocumentsToStorage(restaurantId: string, docs: VerificationDocument[]): void {
  try {
    const key = `feedo_restaurant_documents_${restaurantId}`;
    localStorage.setItem(key, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents to localStorage:', e);
  }
}

/**
 * Load documents from localStorage or Supabase
 */
export async function loadDocumentsFromStorage(
  restaurantId: string,
  defaultDocs: VerificationDocument[]
): Promise<VerificationDocument[]> {
  try {
    const key = `feedo_restaurant_documents_${restaurantId}`;
    const raw = localStorage.getItem(key);
    let loaded: VerificationDocument[] | null = null;

    if (raw) {
      try {
        loaded = JSON.parse(raw);
      } catch (e) {
        loaded = null;
      }
    }

    // Try fetching from Supabase if configured
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured() && restaurantId) {
      try {
        const { data, error } = await client
          .from('restaurant_documents')
          .select('*')
          .eq('restaurant_id', restaurantId);

        if (!error && data && data.length > 0) {
          const mapByType = new Map(data.map((d: any) => [d.doc_type, d]));
          return defaultDocs.map((doc) => {
            const dbDoc: any = mapByType.get(doc.id);
            if (dbDoc) {
              return {
                ...doc,
                status: (dbDoc.status || 'UPLOADED') as any,
                fileName: dbDoc.file_name,
                fileSize: dbDoc.file_size,
                uploadedAt: formatUploadTimestamp(new Date(dbDoc.uploaded_at || Date.now())),
                previewUrl: dbDoc.file_url,
                filePath: dbDoc.file_path,
                mimeType: dbDoc.mime_type,
              };
            }
            // fallback to local stored
            const localMatch = loaded?.find((l) => l.id === doc.id || (doc.id === 'doc-aadhaar' && l.id === 'doc-pan'));
            return localMatch ? { ...doc, ...localMatch, id: doc.id, name: doc.name, description: doc.description } : doc;
          });
        }
      } catch (e) {
        console.warn('Could not query restaurant_documents table:', e);
      }
    }

    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return defaultDocs.map((doc) => {
        const match = loaded!.find((l) => l.id === doc.id || (doc.id === 'doc-aadhaar' && l.id === 'doc-pan'));
        return match ? { ...doc, ...match, id: doc.id, name: doc.name, description: doc.description } : doc;
      });
    }
  } catch (e) {
    console.error('Error loading documents:', e);
  }

  return defaultDocs;
}

/**
 * Validate all required documents before final submission
 */
export function validateRequiredDocuments(documents: VerificationDocument[]): {
  isValid: boolean;
  missingNames: string[];
} {
  const missingNames: string[] = [];

  for (const doc of documents) {
    if (doc.isRequired) {
      if (doc.status === 'NOT_UPLOADED' || !doc.fileName) {
        missingNames.push(doc.name);
      }
    }
  }

  return {
    isValid: missingNames.length === 0,
    missingNames,
  };
}

