const CLOUD_API = 'https://script.google.com/macros/s/AKfycbyBhy86AN9c3oJX1tJryljtGxUI7MI8q9rSJhTTvSM3cHL1WKumTz-f0aNA8QM6xXes8Q/exec';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { action, sheet } = req.query || {};
      if (action !== 'read' || !sheet) {
        return res.status(400).json({ success: false, error: 'Read action and sheet are required' });
      }
      const response = await fetch(CLOUD_API + '?action=read&sheet=' + encodeURIComponent(sheet));
      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch {
        return res.status(502).json({ success: false, error: 'Apps Script returned a non-JSON read response', upstreamStatus: response.status, upstreamResponse: text.slice(0, 500) });
      }
      if (!response.ok || !result.success) {
        return res.status(502).json({ success: false, error: result.error || 'Cloud read failed', upstreamStatus: response.status });
      }
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { action, sheet, data } = req.body || {};

    if (action === 'uploadResourceFile') {
      if (!data || !data.fileName || !data.base64) {
        return res.status(400).json({ success: false, error: 'File name and file data are required' });
      }
      if (data.base64.length > 14000000) {
        return res.status(413).json({ success: false, error: 'File is too large for this upload path. Please use a file smaller than 10 MB.' });
      }
      const uploadResponse = await fetch(CLOUD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'uploadResourceFile', data })
      });
      const uploadText = await uploadResponse.text();
      let uploadResult;
      try { uploadResult = JSON.parse(uploadText); } catch {
        return res.status(502).json({ success: false, error: 'Apps Script returned a non-JSON upload response', upstreamResponse: uploadText.slice(0, 500) });
      }
      if (!uploadResponse.ok || !uploadResult.success) {
        return res.status(502).json({ success: false, error: uploadResult.error || 'Drive upload failed', upstreamStatus: uploadResponse.status });
      }
      return res.status(200).json(uploadResult);
    }

    if (!['add', 'update'].includes(action) || !sheet || !data) {
      return res.status(400).json({ success: false, error: 'Invalid sheet write request' });
    }
    if (action === 'update' && !req.body.row) {
      return res.status(400).json({ success: false, error: 'Row number is required for update' });
    }

    const response = await fetch(CLOUD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, sheet, row: req.body.row, data })
    });
    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch {
      return res.status(502).json({ success: false, error: 'Apps Script returned a non-JSON response', upstreamStatus: response.status, upstreamResponse: text.slice(0, 500) });
    }
    if (!response.ok || !result.success) {
      return res.status(502).json({ success: false, error: result.error || 'Apps Script write failed', upstreamStatus: response.status });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}