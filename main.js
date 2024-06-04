import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import ImageWMS from 'ol/source/ImageWMS';
import LayerSwitcher from 'ol-layerswitcher';
import Group from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

var base_maps = new Group({
  'title': 'Base maps',
  layers: [
      new TileLayer({
          title: 'Satellite',
          type: 'base',
          visible: true,
          source: new XYZ({
              attributions: ['Powered by Esri',
                  'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
              ],
              attributionsCollapsible: false,
              url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              maxZoom: 23
          })
      }),
      
        new TileLayer({
            title: 'OSM',
            type: 'base',
            visible: true,
            source: new OSM()
        })
  ]
});

var water_depth_source = new ImageWMS({
  url: 'http://34.125.247.76:8080/geoserver/River/wms?service=WMS&version=1.1.0&request=GetMap&layers=River%3Awater_dep&bbox=567553.736503396%2C819840.9979921633%2C568397.9759580358%2C820710.9568095499&width=745&height=768&srs=EPSG%3A3857&styles=&format=application/openlayers',
  params: {'LAYERS': 'water_dep'},
  ratio: 1,
  serverType: 'geoserver',
});

var water_depth = new ImageLayer({
  title: "Water Depth",
  source: water_depth_source
});

var overlays = new Group({
  'title': 'Overlays',
  layers: []
});

overlays.getLayers().push(water_depth);

var view = new View({
  center: [567990,820324],
  zoom: 17
});

var map = new Map({
  target: 'map',
  view: view,
  layers: [],
});

map.addLayer(base_maps);
map.addLayer(overlays);

var layerSwitcher = new LayerSwitcher({
  activationMode: 'click',
  startActive: true,
  tipLabel: 'Layers',
  groupSelectStyle: 'children',
  collapseTipLabel: 'Collapse layers',
});

map.addControl(layerSwitcher);
layerSwitcher.renderPanel();

var vectorLayer = new VectorLayer({
  title:'River',
  source: new VectorSource({
    url: 'http://34.125.247.76:8080/geoserver/Niyi/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Niyi%3ARiver&maxFeatures=1000000',
    format: new GeoJSON(),
  })
});

overlays.getLayers().push(vectorLayer);
layerSwitcher.renderPanel();

// Refresh the water depth layer every 1 minute
setInterval(function() {
  var params = water_depth_source.getParams();
  params.t = new Date().getTime();
  water_depth_source.updateParams(params);
}, 1 * 60 * 1000);