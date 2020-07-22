import { HttpClient } from '@angular/common/http'

import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Fill, Stroke, Circle, Style } from 'ol/style';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import GeometryType from 'ol/geom/GeometryType';
import { defaults as defaultInteractions, DragRotateAndZoom } from 'ol/interaction';
import 'ol/ol.css';
import { features } from 'process';

export interface MapProperties {
  lat: any;
  long: any;

  zoom: any;
}
export interface MapPoint {
  type: string,
  lat: any,
  long: any
}
export interface MapData {
  properties: MapProperties,
  points: MapPoint[]
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  title = 'pure-ol';

  map: any;
  mapProperties: any;

  vectorSource: VectorSource = new VectorSource();

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit() {
    this.InitializeMap();
  }

  InitializeMap() {
    this.httpClient.get("assets/data/map-data.json").subscribe(data => {
      this.mapProperties = data;

      var styles = {
        "Point": new Style({
          image: new Icon({
            anchor: [0, 0],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            size: [1024, 1024],
            scale: 0.5,
            src: 'assets/images/tap.svg'
          })
        })
      }

      var styleFunction = function (feature) {


        return styles[feature.getGeometry().getType()];
      };

      this.vectorSource.addFeatures((new GeoJSON()).readFeatures(this.mapProperties.points, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      }));

      var vectorLayer = new VectorLayer({
        source: this.vectorSource,
        styles: styleFunction
      });

      this.map = new Map({
        interactions: defaultInteractions().extend([new DragRotateAndZoom()
        ]),
        layers:
          [new TileLayer({
            source: new OSM()
          }),
            vectorLayer
          ],
        target:
          'box',
        view:
          new View({
            center: olProj.fromLonLat([this.mapProperties.properties.long, this.mapProperties.properties.lat]), zoom: this.mapProperties.properties.zoom
          })
      });
    })
  }
}
