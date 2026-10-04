const CLOUD_API = 'https://script.google.com/macros/s/AKfycbxvxQ2OlL-YtocTnOfk9VU__l5dfcEx0hbU7ZdKUz2FpZUpZtiFgZ0IJ-WQN0MCVzPDcw/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { action, sheet, data } = req.body || {};

    if (!['add', 'update'].includes(action) || !sheet || !data) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sheet write request'
      });
    }

    if (action === 'update' && !req.body.row) {
      return res.status(400).json({
        success: false,
        error: 'Row number is required for update'
      });
    }

    const response = await fetch(CLOUD_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action,
        sheet,
        row: req.body.row,
        data
      })
    });

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return res.status(502).json({
        success: false,
        error: 'Apps Script returned a non-JSON response',
        upstreamStatus: response.status,
        upstreamResponse: text.slice(0, 500)
      });
    }

    if (!response.ok || !result.success) {
      return res.status(502).json({
        success: false,
        error: result.error || 'Apps Script write failed',
        upstreamStatus: response.status
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
