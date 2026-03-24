import fetch from 'node-fetch';

/**
 * Delhivery Tracking API Service
 * Endpoint: https://track.delhivery.com/api/v1/packages/json/
 */

export const fetchTrackingDetails = async (awb) => {
  const token = process.env.DELHIVERY_TOKEN;
  if (!token) {
    console.error('DELHIVERY_TOKEN not found in environment variables');
    return { error: 'Tracking service not configured' };
  }

  try {
    const response = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}&token=${token}`);
    if (!response.ok) {
        throw new Error(`Delhivery API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Delhivery returns an object with a 'ShipmentData' array
    if (data && data.ShipmentData && data.ShipmentData.length > 0) {
      return data.ShipmentData[0].Shipment;
    }
    
    return { error: 'No tracking data found for this AWB' };
  } catch (error) {
    console.error('Delhivery Service Error:', error);
    return { error: 'Failed to fetch tracking data' };
  }
};
