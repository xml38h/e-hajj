import React, { useEffect, useMemo, useState } from 'react';
import { subscribeLiveLocation, LiveLocation } from '../services/trackingService';
import { Language, TranslationSet } from '../types';

function formatTime(iso?: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

const TrackView: React.FC<{ trackId: string; t: TranslationSet; isRtl: boolean }> = ({ trackId, t, isRtl }) => {
  const [loc, setLoc] = useState<LiveLocation | null>(null);

  useEffect(() => {
    const unsub = subscribeLiveLocation(trackId, setLoc);
    return () => unsub();
  }, [trackId]);

  const mapsUrl = useMemo(() => {
    if (!loc) return '';
    return `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
  }, [loc]);

  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ${isRtl ? 'rtl text-right' : ''}`}>
      <h2 className="text-lg font-extrabold text-gray-800 mb-2">Live Tracking</h2>

      {!loc ? (
        <div className="text-gray-500">Waiting for location…</div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">
            <span className="font-bold">Lat:</span> {loc.lat}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-bold">Lng:</span> {loc.lng}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-bold">Accuracy:</span> {loc.accuracy ?? '—'} m
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-bold">Updated:</span> {formatTime(loc.updatedAt)}
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center w-full mt-3 bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default TrackView;
