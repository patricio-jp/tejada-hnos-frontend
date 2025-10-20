import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import type { Plot } from "@/lib/map-types";

interface UsePlotLayerSyncOptions {
  plots: Plot[];
  onSelectPlot: (plot: Plot) => void;
}

interface UsePlotLayerSyncResult {
  layerMapRef: React.MutableRefObject<Map<number, Plot>>;
  handleFeatureGroupRef: (group: L.FeatureGroup | null) => void;
  removePlotLayer: (id: string | number) => void;
  featureGroup: L.FeatureGroup | null;
}

export const usePlotLayerSync = ({
  plots,
  onSelectPlot,
}: UsePlotLayerSyncOptions): UsePlotLayerSyncResult => {
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [isFeatureGroupReady, setFeatureGroupReady] = useState(false);
  const [featureGroup, setFeatureGroup] = useState<L.FeatureGroup | null>(null);

  const layerMapRef = useRef<Map<number, Plot>>(new Map());
  const mockLayerRef = useRef<Map<string, L.Layer[]>>(new Map());

  const cleanupLayer = useCallback((layer: L.Layer) => {
    const candidate = layer as unknown as {
      _leaflet_id?: number;
      off?: (event: string) => void;
      eachLayer?: (cb: (l: L.Layer) => void) => void;
    };

    if (candidate.eachLayer) {
      candidate.eachLayer((nested) => cleanupLayer(nested));
    }

    if (candidate._leaflet_id != null) {
      layerMapRef.current.delete(candidate._leaflet_id);
    }

    if (typeof candidate.off === "function") {
      candidate.off("click");
    }
  }, []);

  const removePlotLayer = useCallback(
    (plotId: string | number) => {
      const fg = featureGroupRef.current;
      if (!fg) return;
      const id = String(plotId);
      const layers = mockLayerRef.current.get(id);
      if (!layers) return;

      layers.forEach((layer) => {
        cleanupLayer(layer);
        fg.removeLayer(layer);
      });
      mockLayerRef.current.delete(id);
    },
    [cleanupLayer]
  );

  const handleFeatureGroupRef = useCallback((group: L.FeatureGroup | null) => {
    featureGroupRef.current = group;
    setFeatureGroup(group);
    setFeatureGroupReady(Boolean(group));
  }, []);

  useEffect(() => {
    if (!isFeatureGroupReady) return;
    const fg = featureGroupRef.current;
    if (!fg) return;

    const mockLayers = mockLayerRef.current;
    const seenIds = new Set<string>();

    plots.forEach((plot, index) => {
      const id = plot.id != null ? String(plot.id) : `plot-auto-${index}`;
      seenIds.add(id);

      const existingLayers = mockLayers.get(id);
      if (existingLayers) {
        existingLayers.forEach((layer) => {
          cleanupLayer(layer);
          fg.removeLayer(layer);
        });
      }

      const geoLayer = L.geoJSON(plot as GeoJsonObject, {
        style: { color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.4, weight: 2 },
      });

      const layersForPlot: L.Layer[] = [];

      geoLayer.eachLayer((subLayer) => {
        const candidate = subLayer as unknown as {
          on?: (event: string, cb: () => void) => void;
          _leaflet_id?: number;
        };
        if (typeof candidate.on === "function") {
          candidate.on("click", () => onSelectPlot(plot));
        }
        if (candidate._leaflet_id != null) {
          layerMapRef.current.set(candidate._leaflet_id, plot);
        }

        (subLayer as unknown as { feature?: Plot }).feature = plot;
        fg.addLayer(subLayer);
        layersForPlot.push(subLayer);
      });

      mockLayers.set(id, layersForPlot);
    });

    mockLayers.forEach((layers, id) => {
      if (!seenIds.has(id)) {
        layers.forEach((layer) => {
          cleanupLayer(layer);
          fg.removeLayer(layer);
        });
        mockLayers.delete(id);
      }
    });

    const snapshot = Array.from(mockLayers.values()).map((layers) => [...layers]);
    return () => {
      snapshot.forEach((layers) => {
        layers.forEach((layer) => {
          cleanupLayer(layer);
          fg.removeLayer(layer);
        });
      });
      mockLayers.clear();
    };
  }, [plots, isFeatureGroupReady, onSelectPlot, cleanupLayer]);

  return {
    layerMapRef,
    handleFeatureGroupRef,
    removePlotLayer,
    featureGroup,
  };
};
