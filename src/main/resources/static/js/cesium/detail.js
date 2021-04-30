class Detail {
    //한반도 중심점
    LO_VALUE = 128.02025;
    LA_VALUE = 38.03375;
    AL_VALUE = 1500000;


    /**
     * 생성자
     */
    constructor() {
        this.viewer = null;

        this.lonLatScales = [];
        this.colors = [];

        this.layers = [{
            url: 'http://1.221.237.242:38080/geoserver/wms',
            layerKorName: '읍면동',
            layerName: 'dsms:national_emd',
            index: -1
        }, {
            url: 'http://127.0.0.1:28080/geoserver/wms',
            layerKorName: '경계 3km 버퍼',
            layerName: 'sdt:Boundary_3km_Buffer',
            index: -1
        }, {
            url: 'http://127.0.0.1:28080/geoserver/wms',
            layerKorName: '불 골든시간',
            layerName: 'sdt:Fire_GoldenHour',
            index: -1
        }, {
            url: 'http://127.0.0.1:28080/geoserver/wms',
            layerKorName: '병원 골든시간',
            layerName: 'sdt:Hospital_GoldenHour',
            index: -1
        }, {
            url: 'http://127.0.0.1:28080/geoserver/wms',
            layerKorName: '기상청 관측지점',
            layerName: 'sdt:Weather_Point_4326_4',
            index: -1
        }, {
            url: 'http://127.0.0.1:28080/geoserver/wms',
            layerKorName: '지진(1978~2019)',
            layerName: 'sdt:Earth_Quake_1978-2019',
            index: -1,
            legend: 'http://127.0.0.1:28080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=50&HEIGHT=20&LAYER=sdt:Earth_Quake_1978-2019'
        }];
    }


    /**
     * 초기
     */
    init() {
        this.setEventHandler();

        //viewer 초기화
        this.viewer = this.initViewer();

        //한반도 전경으로 이동
        this.flyTo(this.LO_VALUE, this.LA_VALUE, this.AL_VALUE);


        this.layers.forEach(item => {
            let index = this.addImageryProvider(item.url, item.layerName);
            item.index = index;
        });


        this.showLayers();
        this.addLayerClickEvent();

        this.initDatas();
        this.initColors();

    }

    setEventHandler() {
        let self = this;
        document.querySelector('img.logo').addEventListener('click', () => {
            self.flyTo(this.LO_VALUE, this.LA_VALUE, this.AL_VALUE);

        });
    }


    /**
     * 레이어 on/off 이벤트 추가
     */
    addLayerClickEvent() {
        let self = this;


        VV.Ui.click('div.layers [type=checkbox]', (evt) => {
            let index = evt.currentTarget.value;

            if (evt.currentTarget.checked) {
                self.onLayer(index);
                let layer = self.getLayerByIndex(index);
                if (null == layer) {
                    return;
                }

                document.querySelector('img.legend').src = layer[0].legend;

                self.showPolyline();
            } else {
                self.offLayer(index);
            }
        });
    }


    /**
     * off 레이어
     * @param {*} index
     */
    offLayer(index) {
        this.viewer.imageryLayers._layers[index].show = false;
    }


    /**
     * on 레이어
     * @param {*} index
     */
    onLayer(index) {
        this.viewer.imageryLayers._layers[index].show = true;
    }


    /**
     * 레이어 목록 화면에 표시하기
     */
    showLayers() {

        let s = '';
        this.layers.forEach(item => {
            s += `<div>`;
            s += `  <label>`;
            s += `      <input type="checkbox" value="${item.index}" >${item.layerKorName}`;
            s += `  </label>`;
            s += `</div>`;
        });

        document.querySelector('div.layers').innerHTML = s;
    }


    /**
     * imageryProvider 추가
     * @param {*} url
     * @param {*} layerName
     * @returns
     */
    addImageryProvider(url, layerName) {
        //
        let imageryProvider = new Cesium.WebMapServiceImageryProvider({
            url: url,
            parameters: {
                format: 'image/png',
                transparent: true,
                tiled: true,
                enablePickFeatures: true
            },
            layers: layerName,
            maximumLevel: 12
        });
        this.viewer.imageryLayers.addImageryProvider(imageryProvider);
        let index = this.viewer.imageryLayers._layers.length - 1;
        this.viewer.imageryLayers._layers[index].show = false;

        return index;

        //
        // let weatherPoint2 = new Cesium.WebMapServiceImageryProvider({
        //     url: 'http://127.0.0.1:28080/geoserver/wms',
        //     parameters: {
        //         format: 'image/png',
        //         transparent: true,
        //         tiled: true,
        //         enablePickFeatures : true
        //     },
        //     layers: 'sdt:Weather_Point_4326_4',
        //     maximumLevel: 12
        // });
        // this.viewer.imageryLayers.addImageryProvider(weatherPoint2);
        // this.viewer.imageryLayers._layers[2].show = true;
    }


    /**
     * 카메라 이동
     * @param {*} lon
     * @param {*} lat
     * @param {*} alt
     */
    flyTo(lon, lat, alt) {
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt)
        })
    }


    getLayerByIndex(index) {
        return this.layers.filter(layer => index == layer.index);
    }


    showPolyline() {
        let self = this;


        this.lonLatScales.forEach(x => {
            //console.log(Cesium.Cartesian3.fromDegrees(x.lon + 0.000001, x.lat + 0.000001, 10000));
            this.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(x.lon + 0.000001, x.lat + 0.000001, self.getHeight(x.scale)),
                polyline: {
                    positions: [
                        Cesium.Cartesian3.fromDegrees(x.lon, x.lat, 0),
                        Cesium.Cartesian3.fromDegrees(x.lon + 0.000001, x.lat + 0.000001, self.getHeight(x.scale))
                    ],
                    width: self.getWidth(x.scale),
                    material: self.getColor(x.scale),
                    clampToGround: false
                }
            });


        });

    }

    getWidth(scale) {
        return scale * 2;
    }


    getColor(scale) {
        return Cesium.Color.fromCssColorString(this.colors.filter(x => (x.min <= scale && scale < x.max))[0].color);
    }

    getHeight(scale) {
        return (scale * scale * scale) * 100;
    }


    initDatas() {
        this.lonLatScales = [
            {
                "lon": 127.9,
                "lat": 36.6,
                "scale": 5.2
            },
            {
                "lon": 126.7,
                "lat": 36.6,
                "scale": 5
            },
            {
                "lon": 128.7,
                "lat": 37.4,
                "scale": 2.8
            },
            {
                "lon": 126.7,
                "lat": 36.6,
                "scale": 2.9
            },
            {
                "lon": 128.3,
                "lat": 36.1,
                "scale": 3
            },
            {
                "lon": 126.7,
                "lat": 36.6,
                "scale": 4
            },
            {
                "lon": 126.7,
                "lat": 36.6,
                "scale": 2.9
            },
            {
                "lon": 126.7,
                "lat": 36.6,
                "scale": 3.8
            },
            {
                "lon": 128.5,
                "lat": 36.8,
                "scale": 3
            },
            {
                "lon": 128.5,
                "lat": 36.3,
                "scale": 3.5
            },
            {
                "lon": 126.4,
                "lat": 37,
                "scale": 2.4
            },
            {
                "lon": 127.9,
                "lat": 38.3,
                "scale": 3
            },
            {
                "lon": 127.5,
                "lat": 35.4,
                "scale": 3.5
            },
            {
                "lon": 127.3,
                "lat": 36.2,
                "scale": 3
            },
            {
                "lon": 128.6,
                "lat": 36,
                "scale": 2.7
            },
            {
                "lon": 128.9,
                "lat": 36,
                "scale": 2.6
            },
            {
                "lon": 126.3,
                "lat": 36.9,
                "scale": 3.5
            },
            {
                "lon": 128.7,
                "lat": 37.3,
                "scale": 2.6
            },
            {
                "lon": 127.5,
                "lat": 36.1,
                "scale": 2.6
            },
            {
                "lon": 127.6,
                "lat": 36.4,
                "scale": 3
            },
            {
                "lon": 127.8,
                "lat": 36.8,
                "scale": 3.4
            },
            {
                "lon": 127.5,
                "lat": 36.8,
                "scale": 3
            },
            {
                "lon": 128.1,
                "lat": 36.5,
                "scale": 3
            },
            {
                "lon": 126.6,
                "lat": 36.8,
                "scale": 3.2
            },
            {
                "lon": 128.2,
                "lat": 36.1,
                "scale": 2.2
            },
            {
                "lon": 126.6,
                "lat": 35.1,
                "scale": 2.5
            },
            {
                "lon": 126.7,
                "lat": 35.1,
                "scale": 2.6
            },
            {
                "lon": 126.7,
                "lat": 35.2,
                "scale": 2.6
            },
            {
                "lon": 126.8,
                "lat": 37,
                "scale": 2.2
            },
            {
                "lon": 128.5,
                "lat": 35.8,
                "scale": 2.4
            },
            {
                "lon": 128.6,
                "lat": 36.6,
                "scale": 2.9
            },
            {
                "lon": 128.6,
                "lat": 35.9,
                "scale": 3.3
            },
            {
                "lon": 128.9,
                "lat": 36.7,
                "scale": 2.9
            },
            {
                "lon": 126.9,
                "lat": 35.7,
                "scale": 2.8
            },
            {
                "lon": 129.5,
                "lat": 35.9,
                "scale": 3.2
            },
            {
                "lon": 124.2,
                "lat": 39.1,
                "scale": 4.5
            },
            {
                "lon": 125.6,
                "lat": 38.4,
                "scale": 4.6
            },
            {
                "lon": 126.3,
                "lat": 35.9,
                "scale": 3.3
            },
            {
                "lon": 126,
                "lat": 35.7,
                "scale": 3
            },
            {
                "lon": 126,
                "lat": 38.3,
                "scale": 3.3
            },
            {
                "lon": 125.7,
                "lat": 38.4,
                "scale": 3.7
            },
            {
                "lon": 125.1,
                "lat": 38.3,
                "scale": 2.7
            },
            {
                "lon": 125.7,
                "lat": 39.7,
                "scale": 3.3
            },
            {
                "lon": 125.8,
                "lat": 39.5,
                "scale": 2.5
            },
            {
                "lon": 124,
                "lat": 36.6,
                "scale": 3.8
            },
            {
                "lon": 125.7,
                "lat": 38.9,
                "scale": 3.1
            },
            {
                "lon": 125.7,
                "lat": 39.5,
                "scale": 3.7
            },
            {
                "lon": 126.1,
                "lat": 35.9,
                "scale": 3.2
            },
            {
                "lon": 126.3,
                "lat": 38.8,
                "scale": 3.2
            },
            {
                "lon": 125,
                "lat": 40.2,
                "scale": 5.3
            },
            {
                "lon": 125.7,
                "lat": 38.3,
                "scale": 3.1
            },
            {
                "lon": 125.7,
                "lat": 39.4,
                "scale": 2.8
            },
            {
                "lon": 126,
                "lat": 34,
                "scale": 3.6
            },
            {
                "lon": 125.7,
                "lat": 38.8,
                "scale": 3.5
            },
            {
                "lon": 125.3,
                "lat": 37.1,
                "scale": 2.5
            },
            {
                "lon": 126,
                "lat": 39.5,
                "scale": 2.6
            },
            {
                "lon": 125.8,
                "lat": 39.4,
                "scale": 2.6
            },
            {
                "lon": 125.6,
                "lat": 38.8,
                "scale": 2.7
            },
            {
                "lon": 127.2,
                "lat": 40.7,
                "scale": 3.5
            },
            {
                "lon": 127.2,
                "lat": 40.7,
                "scale": 3
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.4
            },
            {
                "lon": 126.1,
                "lat": 38.4,
                "scale": 2.8
            },
            {
                "lon": 129.4,
                "lat": 38.2,
                "scale": 2.5
            },
            {
                "lon": 126.4,
                "lat": 39.8,
                "scale": 2.8
            },
            {
                "lon": 124.8,
                "lat": 39.7,
                "scale": 3.5
            },
            {
                "lon": 125.7,
                "lat": 38.9,
                "scale": 3
            },
            {
                "lon": 125.4,
                "lat": 38.9,
                "scale": 3.7
            },
            {
                "lon": 130.1,
                "lat": 35.9,
                "scale": 4.8
            },
            {
                "lon": 125.6,
                "lat": 39.4,
                "scale": 2.8
            },
            {
                "lon": 126.1,
                "lat": 38.7,
                "scale": 3
            },
            {
                "lon": 125.8,
                "lat": 39.5,
                "scale": 3
            },
            {
                "lon": 125.7,
                "lat": 37.8,
                "scale": 2.8
            },
            {
                "lon": 129.8,
                "lat": 35.8,
                "scale": 3.5
            },
            {
                "lon": 126.6,
                "lat": 39.6,
                "scale": 2.6
            },
            {
                "lon": 125.5,
                "lat": 39.7,
                "scale": 3.4
            },
            {
                "lon": 125.9,
                "lat": 38.9,
                "scale": 3
            },
            {
                "lon": 128.2,
                "lat": 34.5,
                "scale": 2.7
            },
            {
                "lon": 125.7,
                "lat": 38.3,
                "scale": 4.5
            },
            {
                "lon": 125.7,
                "lat": 38.8,
                "scale": 3.4
            },
            {
                "lon": 129.8,
                "lat": 37.2,
                "scale": 4.7
            },
            {
                "lon": 125.3,
                "lat": 37.6,
                "scale": 3.6
            },
            {
                "lon": 125.8,
                "lat": 38.6,
                "scale": 3.5
            },
            {
                "lon": 125.9,
                "lat": 37.2,
                "scale": 4
            },
            {
                "lon": 125.9,
                "lat": 37.1,
                "scale": 3.3
            },
            {
                "lon": 126,
                "lat": 37.1,
                "scale": 3.5
            },
            {
                "lon": 126,
                "lat": 37.1,
                "scale": 3.2
            },
            {
                "lon": 129.6,
                "lat": 36.4,
                "scale": 3.1
            },
            {
                "lon": 125.6,
                "lat": 38.7,
                "scale": 3.4
            },
            {
                "lon": 124.9,
                "lat": 38,
                "scale": 2.9
            },
            {
                "lon": 126.5,
                "lat": 38.6,
                "scale": 2.6
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.8
            },
            {
                "lon": 126.1,
                "lat": 37.7,
                "scale": 2.6
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.9
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.5
            },
            {
                "lon": 126.3,
                "lat": 38.9,
                "scale": 3.2
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 3.1
            },
            {
                "lon": 125.9,
                "lat": 39.5,
                "scale": 2.8
            },
            {
                "lon": 126,
                "lat": 36.4,
                "scale": 3.5
            },
            {
                "lon": 126.1,
                "lat": 38.3,
                "scale": 4.2
            },
            {
                "lon": 124.9,
                "lat": 38.9,
                "scale": 2.9
            },
            {
                "lon": 126.1,
                "lat": 39.6,
                "scale": 3.3
            },
            {
                "lon": 125.7,
                "lat": 38.8,
                "scale": 3.5
            },
            {
                "lon": 125.6,
                "lat": 36.9,
                "scale": 2.5
            },
            {
                "lon": 126.1,
                "lat": 38.2,
                "scale": 2.3
            },
            {
                "lon": 129.5,
                "lat": 37.4,
                "scale": 3
            },
            {
                "lon": 124.6,
                "lat": 37.1,
                "scale": 2.9
            },
            {
                "lon": 126.2,
                "lat": 39.6,
                "scale": 2.4
            },
            {
                "lon": 125.5,
                "lat": 37,
                "scale": 3.2
            },
            {
                "lon": 126.1,
                "lat": 39.5,
                "scale": 3
            },
            {
                "lon": 125.9,
                "lat": 39.1,
                "scale": 2.6
            },
            {
                "lon": 125.7,
                "lat": 39.3,
                "scale": 3.1
            },
            {
                "lon": 125.1,
                "lat": 38.6,
                "scale": 3.2
            },
            {
                "lon": 125.2,
                "lat": 36,
                "scale": 3.9
            },
            {
                "lon": 125,
                "lat": 37.2,
                "scale": 2.8
            },
            {
                "lon": 125.9,
                "lat": 38.9,
                "scale": 2.9
            },
            {
                "lon": 125.9,
                "lat": 39.9,
                "scale": 2.6
            },
            {
                "lon": 129.9,
                "lat": 34.6,
                "scale": 4.2
            },
            {
                "lon": 130,
                "lat": 34.7,
                "scale": 3.4
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.1
            },
            {
                "lon": 125.1,
                "lat": 38.4,
                "scale": 2.7
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.2
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.2
            },
            {
                "lon": 127,
                "lat": 41.6,
                "scale": 3.4
            },
            {
                "lon": 125.6,
                "lat": 38.1,
                "scale": 2.9
            },
            {
                "lon": 125.9,
                "lat": 38.3,
                "scale": 2.4
            },
            {
                "lon": 125.9,
                "lat": 39.4,
                "scale": 3.1
            },
            {
                "lon": 125.8,
                "lat": 38.5,
                "scale": 2.8
            },
            {
                "lon": 126.4,
                "lat": 37.3,
                "scale": 4
            },
            {
                "lon": 126.4,
                "lat": 37.3,
                "scale": 2.8
            },
            {
                "lon": 129.7,
                "lat": 36.9,
                "scale": 3.8
            },
            {
                "lon": 126.4,
                "lat": 37.3,
                "scale": 2.6
            },
            {
                "lon": 125.8,
                "lat": 38.5,
                "scale": 2.4
            },
            {
                "lon": 125.9,
                "lat": 39.4,
                "scale": 2.8
            },
            {
                "lon": 125.1,
                "lat": 38.4,
                "scale": 3.1
            },
            {
                "lon": 125.8,
                "lat": 39.8,
                "scale": 3.1
            },
            {
                "lon": 129.7,
                "lat": 35.8,
                "scale": 3.2
            },
            {
                "lon": 125.8,
                "lat": 39.3,
                "scale": 3
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.3
            },
            {
                "lon": 126.4,
                "lat": 33.5,
                "scale": 3
            },
            {
                "lon": 125.8,
                "lat": 35.9,
                "scale": 3.3
            },
            {
                "lon": 125.7,
                "lat": 39.4,
                "scale": 2.7
            },
            {
                "lon": 125.1,
                "lat": 34.2,
                "scale": 3.6
            },
            {
                "lon": 125.9,
                "lat": 38.8,
                "scale": 2.6
            },
            {
                "lon": 125.5,
                "lat": 36.6,
                "scale": 3.5
            },
            {
                "lon": 125.6,
                "lat": 36.5,
                "scale": 3.3
            },
            {
                "lon": 125.8,
                "lat": 36.6,
                "scale": 3.4
            },
            {
                "lon": 125.7,
                "lat": 36.7,
                "scale": 3
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 3.1
            },
            {
                "lon": 125.9,
                "lat": 36.6,
                "scale": 3.1
            },
            {
                "lon": 126.9,
                "lat": 34.3,
                "scale": 3.2
            },
            {
                "lon": 129.2,
                "lat": 36.2,
                "scale": 2.9
            },
            {
                "lon": 127.9,
                "lat": 36.3,
                "scale": 2.5
            },
            {
                "lon": 127.3,
                "lat": 36.3,
                "scale": 3.4
            },
            {
                "lon": 127.8,
                "lat": 36.7,
                "scale": 3.5
            },
            {
                "lon": 127.4,
                "lat": 36.3,
                "scale": 2.5
            },
            {
                "lon": 127.8,
                "lat": 36.4,
                "scale": 2.4
            },
            {
                "lon": 127.1,
                "lat": 37.5,
                "scale": 2.3
            },
            {
                "lon": 126.7,
                "lat": 36.5,
                "scale": 2.5
            },
            {
                "lon": 128.8,
                "lat": 36.4,
                "scale": 2.7
            },
            {
                "lon": 126.4,
                "lat": 37,
                "scale": 2.7
            },
            {
                "lon": 128.7,
                "lat": 36.5,
                "scale": 3.1
            },
            {
                "lon": 127.2,
                "lat": 36.1,
                "scale": 3
            },
            {
                "lon": 128.5,
                "lat": 35.9,
                "scale": 2.2
            },
            {
                "lon": 126.7,
                "lat": 35.3,
                "scale": 2
            },
            {
                "lon": 127.9,
                "lat": 36.5,
                "scale": 2.6
            },
            {
                "lon": 128.8,
                "lat": 35.8,
                "scale": 2.7
            },
            {
                "lon": 127.9,
                "lat": 35.3,
                "scale": 3.1
            },
            {
                "lon": 128,
                "lat": 35.6,
                "scale": 3.1
            },
            {
                "lon": 129.3,
                "lat": 36.8,
                "scale": 3.2
            },
            {
                "lon": 127.3,
                "lat": 36,
                "scale": 2
            },
            {
                "lon": 127.2,
                "lat": 36.2,
                "scale": 2.9
            },
            {
                "lon": 128.4,
                "lat": 35.8,
                "scale": 2.6
            },
            {
                "lon": 126.8,
                "lat": 37,
                "scale": 2.7
            },
            {
                "lon": 128.2,
                "lat": 36,
                "scale": 2.6
            },
            {
                "lon": 126.4,
                "lat": 37.7,
                "scale": 2.6
            },
            {
                "lon": 128.3,
                "lat": 38.1,
                "scale": 2.1
            },
            {
                "lon": 126.9,
                "lat": 35.6,
                "scale": 3.3
            },
            {
                "lon": 126.8,
                "lat": 35.6,
                "scale": 3.9
            },
            {
                "lon": 128.3,
                "lat": 35.2,
                "scale": 2.2
            },
            {
                "lon": 126.9,
                "lat": 36.6,
                "scale": 2.2
            },
            {
                "lon": 128.3,
                "lat": 36.5,
                "scale": 2.2
            },
            {
                "lon": 128.4,
                "lat": 35.2,
                "scale": 3.6
            },
            {
                "lon": 127.9,
                "lat": 35.7,
                "scale": 2.9
            },
            {
                "lon": 129.1,
                "lat": 35.9,
                "scale": 3.1
            },
            {
                "lon": 128.3,
                "lat": 35.9,
                "scale": 2
            },
            {
                "lon": 127.3,
                "lat": 36.4,
                "scale": 3.5
            },
            {
                "lon": 127.9,
                "lat": 35.6,
                "scale": 2.5
            },
            {
                "lon": 128.2,
                "lat": 36.3,
                "scale": 2.3
            },
            {
                "lon": 128.9,
                "lat": 36.4,
                "scale": 3.2
            },
            {
                "lon": 128.1,
                "lat": 36.4,
                "scale": 2
            },
            {
                "lon": 128.7,
                "lat": 35.8,
                "scale": 2.5
            },
            {
                "lon": 128.2,
                "lat": 36.4,
                "scale": 3
            },
            {
                "lon": 129.3,
                "lat": 37,
                "scale": 2.2
            },
            {
                "lon": 126.9,
                "lat": 33.5,
                "scale": 2.4
            },
            {
                "lon": 126.8,
                "lat": 36.3,
                "scale": 2.4
            },
            {
                "lon": 126,
                "lat": 37.1,
                "scale": 3.5
            },
            {
                "lon": 125.5,
                "lat": 38.7,
                "scale": 4
            },
            {
                "lon": 126.1,
                "lat": 35.3,
                "scale": 2.8
            },
            {
                "lon": 129.1,
                "lat": 37.8,
                "scale": 2.2
            },
            {
                "lon": 129.9,
                "lat": 35.9,
                "scale": 3.1
            },
            {
                "lon": 130.1,
                "lat": 36.2,
                "scale": 3.5
            },
            {
                "lon": 130.1,
                "lat": 37.5,
                "scale": 3.7
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.5
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.5
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.3
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.4
            },
            {
                "lon": 127,
                "lat": 40.4,
                "scale": 3.7
            },
            {
                "lon": 126.3,
                "lat": 38.3,
                "scale": 3.4
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 3
            },
            {
                "lon": 126.2,
                "lat": 38.4,
                "scale": 3.4
            },
            {
                "lon": 126.1,
                "lat": 38.5,
                "scale": 3.2
            },
            {
                "lon": 124.9,
                "lat": 38.1,
                "scale": 3.4
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 3.3
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 3.3
            },
            {
                "lon": 125.5,
                "lat": 38.2,
                "scale": 3.4
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.9
            },
            {
                "lon": 125.9,
                "lat": 37.9,
                "scale": 3.1
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 3.1
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 3.2
            },
            {
                "lon": 125.8,
                "lat": 37.8,
                "scale": 3.2
            },
            {
                "lon": 126.3,
                "lat": 38.6,
                "scale": 3.1
            },
            {
                "lon": 126.2,
                "lat": 38.1,
                "scale": 3.2
            },
            {
                "lon": 125.9,
                "lat": 38,
                "scale": 2.8
            },
            {
                "lon": 126.2,
                "lat": 38.2,
                "scale": 2.8
            },
            {
                "lon": 125.6,
                "lat": 36.6,
                "scale": 2.9
            },
            {
                "lon": 126.2,
                "lat": 38.3,
                "scale": 2.7
            },
            {
                "lon": 123.9,
                "lat": 38.2,
                "scale": 3.3
            },
            {
                "lon": 126.4,
                "lat": 38.3,
                "scale": 2.8
            },
            {
                "lon": 126.2,
                "lat": 38,
                "scale": 2.5
            },
            {
                "lon": 126.3,
                "lat": 38.3,
                "scale": 3.1
            },
            {
                "lon": 125.8,
                "lat": 38.7,
                "scale": 2.6
            },
            {
                "lon": 126.3,
                "lat": 38.2,
                "scale": 2.7
            },
            {
                "lon": 126.3,
                "lat": 38.1,
                "scale": 2.6
            },
            {
                "lon": 123.7,
                "lat": 37.8,
                "scale": 2.6
            },
            {
                "lon": 130,
                "lat": 35.9,
                "scale": 3.4
            },
            {
                "lon": 124.7,
                "lat": 37.6,
                "scale": 3.4
            },
            {
                "lon": 129.8,
                "lat": 37.3,
                "scale": 2.8
            },
            {
                "lon": 123.8,
                "lat": 33.4,
                "scale": 3.4
            },
            {
                "lon": 0,
                "lat": 0,
                "scale": 2.4
            },
            {
                "lon": 126.1,
                "lat": 39.1,
                "scale": 2.6
            },
            {
                "lon": 129.7,
                "lat": 36.5,
                "scale": 2.7
            },
            {
                "lon": 129.6,
                "lat": 35.6,
                "scale": 2.8
            },
            {
                "lon": 127.2,
                "lat": 38.5,
                "scale": 2.2
            },
            {
                "lon": 129.9,
                "lat": 35.4,
                "scale": 4
            },
            {
                "lon": 126.1,
                "lat": 37.1,
                "scale": 2.5
            },
            {
                "lon": 127.1,
                "lat": 39.1,
                "scale": 3.1
            },
            {
                "lon": 122.8,
                "lat": 34.7,
                "scale": 4.4
            },
            {
                "lon": 123.7,
                "lat": 35.8,
                "scale": 3.4
            },
            {
                "lon": 125.4,
                "lat": 38.5,
                "scale": 3.8
            },
            {
                "lon": 125.3,
                "lat": 38.4,
                "scale": 3.4
            },
            {
                "lon": 130.1,
                "lat": 35.3,
                "scale": 4
            },
            {
                "lon": 125.7,
                "lat": 41.1,
                "scale": 3.1
            },
            {
                "lon": 127.8,
                "lat": 38.7,
                "scale": 2.1
            },
            {
                "lon": 126.4,
                "lat": 35.6,
                "scale": 2.9
            },
            {
                "lon": 124.8,
                "lat": 37.5,
                "scale": 2.8
            },
            {
                "lon": 129.9,
                "lat": 36.6,
                "scale": 2.6
            },
            {
                "lon": 130,
                "lat": 36.4,
                "scale": 2.8
            },
            {
                "lon": 123.8,
                "lat": 33.1,
                "scale": 4.5
            },
            {
                "lon": 130.6,
                "lat": 34.9,
                "scale": 2.9
            },
            {
                "lon": 130.5,
                "lat": 37.3,
                "scale": 2.9
            },
            {
                "lon": 126.7,
                "lat": 38.7,
                "scale": 2.2
            },
            {
                "lon": 125.5,
                "lat": 37.5,
                "scale": 2.7
            },
            {
                "lon": 125.7,
                "lat": 38.8,
                "scale": 2.6
            },
            {
                "lon": 125.9,
                "lat": 39.6,
                "scale": 3.4
            },
            {
                "lon": 127.6,
                "lat": 38.5,
                "scale": 2.6
            },
            {
                "lon": 123.9,
                "lat": 36.3,
                "scale": 3
            },
            {
                "lon": 126.4,
                "lat": 38.4,
                "scale": 2.3
            },
            {
                "lon": 129.4,
                "lat": 37.4,
                "scale": 2.2
            },
            {
                "lon": 127.9,
                "lat": 34.4,
                "scale": 2.7
            },
            {
                "lon": 129.6,
                "lat": 35.9,
                "scale": 2.7
            },
            {
                "lon": 125.5,
                "lat": 38.5,
                "scale": 3.1
            },
            {
                "lon": 131,
                "lat": 34.9,
                "scale": 4.6
            },
            {
                "lon": 131.1,
                "lat": 35.1,
                "scale": 4.5
            },
            {
                "lon": 130.9,
                "lat": 35.7,
                "scale": 4.1
            },
            {
                "lon": 124.1,
                "lat": 34.9,
                "scale": 4.9
            },
            {
                "lon": 127.5,
                "lat": 38.5,
                "scale": 2.1
            },
            {
                "lon": 124.8,
                "lat": 37.4,
                "scale": 2.8
            },
            {
                "lon": 125.6,
                "lat": 38.8,
                "scale": 3.5
            },
            {
                "lon": 125.8,
                "lat": 38.9,
                "scale": 3.4
            },
            {
                "lon": 123.8,
                "lat": 37.9,
                "scale": 3.6
            },
            {
                "lon": 125.4,
                "lat": 36.1,
                "scale": 2.8
            },
            {
                "lon": 126,
                "lat": 35.3,
                "scale": 2.4
            },
            {
                "lon": 128.1,
                "lat": 34.8,
                "scale": 2.3
            },
            {
                "lon": 124.5,
                "lat": 37.9,
                "scale": 3
            },
            {
                "lon": 125,
                "lat": 34.2,
                "scale": 3.3
            },
            {
                "lon": 126,
                "lat": 38.9,
                "scale": 2.4
            },
            {
                "lon": 126,
                "lat": 38.9,
                "scale": 2.5
            },
            {
                "lon": 126,
                "lat": 39.6,
                "scale": 2.6
            },
            {
                "lon": 125.6,
                "lat": 38.7,
                "scale": 3
            },
            {
                "lon": 131.1,
                "lat": 35.7,
                "scale": 2.5
            },
            {
                "lon": 128.9,
                "lat": 34.7,
                "scale": 2.5
            },
            {
                "lon": 126,
                "lat": 39.3,
                "scale": 3.4
            },
            {
                "lon": 124.3,
                "lat": 37.6,
                "scale": 2.9
            },
            {
                "lon": 126.4,
                "lat": 38.7,
                "scale": 2.5
            },
            {
                "lon": 129.5,
                "lat": 36.8,
                "scale": 2.6
            },
            {
                "lon": 124.4,
                "lat": 38.2,
                "scale": 4.2
            },
            {
                "lon": 123.7,
                "lat": 36.3,
                "scale": 2.8
            },
            {
                "lon": 124.6,
                "lat": 37.9,
                "scale": 2.9
            },
            {
                "lon": 124.6,
                "lat": 38,
                "scale": 3.6
            },
            {
                "lon": 123.7,
                "lat": 36.2,
                "scale": 2.8
            },
            {
                "lon": 129.2,
                "lat": 36.9,
                "scale": 2.9
            },
            {
                "lon": 128.1,
                "lat": 36.6,
                "scale": 2.6
            },
            {
                "lon": 127.5,
                "lat": 34.6,
                "scale": 2.5
            },
            {
                "lon": 127.8,
                "lat": 36.4,
                "scale": 2.2
            },
            {
                "lon": 128.1,
                "lat": 36.6,
                "scale": 2.5
            },
            {
                "lon": 127.9,
                "lat": 35.8,
                "scale": 2.3
            },
            {
                "lon": 127.9,
                "lat": 35.9,
                "scale": 3.1
            },
            {
                "lon": 127,
                "lat": 36.3,
                "scale": 2.8
            },
            {
                "lon": 127.7,
                "lat": 35.9,
                "scale": 2.1
            },
            {
                "lon": 127.5,
                "lat": 36.5,
                "scale": 2.1
            },
            {
                "lon": 129.1,
                "lat": 35.3,
                "scale": 2.8
            },
            {
                "lon": 129.1,
                "lat": 36.8,
                "scale": 2.4
            },
            {
                "lon": 126.9,
                "lat": 36.1,
                "scale": 2.8
            },
            {
                "lon": 126.5,
                "lat": 36.9,
                "scale": 2.8
            },
            {
                "lon": 128,
                "lat": 36.7,
                "scale": 3
            },
            {
                "lon": 128.3,
                "lat": 36.1,
                "scale": 3.3
            },
            {
                "lon": 129.3,
                "lat": 35.6,
                "scale": 2.3
            },
            {
                "lon": 128.8,
                "lat": 37.2,
                "scale": 4.5
            },
            {
                "lon": 128.8,
                "lat": 37.3,
                "scale": 3
            },
            {
                "lon": 128.8,
                "lat": 37.3,
                "scale": 2.7
            },
            {
                "lon": 128.8,
                "lat": 37.2,
                "scale": 2.5
            },
            {
                "lon": 128.6,
                "lat": 37.3,
                "scale": 2.7
            },
            {
                "lon": 128.6,
                "lat": 37.3,
                "scale": 2.8
            },
            {
                "lon": 128.5,
                "lat": 37.3,
                "scale": 2.5
            },
            {
                "lon": 126.8,
                "lat": 36,
                "scale": 3.5
            },
            {
                "lon": 129.1,
                "lat": 35.3,
                "scale": 2.7
            },
            {
                "lon": 129.3,
                "lat": 35.8,
                "scale": 4.2
            },
            {
                "lon": 127.7,
                "lat": 36.1,
                "scale": 2.8
            },
            {
                "lon": 128.7,
                "lat": 37.2,
                "scale": 2.3
            },
            {
                "lon": 128.4,
                "lat": 36.7,
                "scale": 2.8
            },
            {
                "lon": 128,
                "lat": 35,
                "scale": 2.4
            },
            {
                "lon": 128.7,
                "lat": 35.9,
                "scale": 3.2
            },
            {
                "lon": 128.8,
                "lat": 37.3,
                "scale": 3
            },
            {
                "lon": 126.8,
                "lat": 37.8,
                "scale": 2.5
            },
            {
                "lon": 127.4,
                "lat": 36.3,
                "scale": 2.3
            },
            {
                "lon": 128.4,
                "lat": 36.6,
                "scale": 2.3
            },
            {
                "lon": 128,
                "lat": 36.1,
                "scale": 2.5
            },
            {
                "lon": 128.4,
                "lat": 36.7,
                "scale": 2.2
            },
            {
                "lon": 128.4,
                "lat": 36.7,
                "scale": 2.3
            },
            {
                "lon": 127.8,
                "lat": 36.8,
                "scale": 2
            },
            {
                "lon": 128.8,
                "lat": 35.5,
                "scale": 2.9
            },
            {
                "lon": 128.5,
                "lat": 36.1,
                "scale": 2.1
            },
            {
                "lon": 129.3,
                "lat": 35.9,
                "scale": 2.3
            },
            {
                "lon": 126.9,
                "lat": 36.1,
                "scale": 3.6
            },
            {
                "lon": 126.9,
                "lat": 35.8,
                "scale": 3.3
            },
            {
                "lon": 128.8,
                "lat": 37.3,
                "scale": 2.5
            },
            {
                "lon": 128.3,
                "lat": 35.8,
                "scale": 2.5
            },
            {
                "lon": 128.7,
                "lat": 37.2,
                "scale": 2.8
            },
            {
                "lon": 129.1,
                "lat": 37.5,
                "scale": 2.7
            },
            {
                "lon": 128.8,
                "lat": 37,
                "scale": 3.3
            },
            {
                "lon": 128.9,
                "lat": 37.1,
                "scale": 2.5
            },
            {
                "lon": 128.9,
                "lat": 37.2,
                "scale": 3.3
            },
            {
                "lon": 128.9,
                "lat": 37.2,
                "scale": 2.9
            },
            {
                "lon": 128.9,
                "lat": 37.2,
                "scale": 2.6
            },
            {
                "lon": 128.9,
                "lat": 37.3,
                "scale": 2.8
            },
            {
                "lon": 127.1,
                "lat": 36.7,
                "scale": 2.1
            },
            {
                "lon": 127.8,
                "lat": 36.5,
                "scale": 2
            },
            {
                "lon": 128.9,
                "lat": 37.3,
                "scale": 2.2
            },
            {
                "lon": 129.3,
                "lat": 36,
                "scale": 3.2
            },
            {
                "lon": 127.1,
                "lat": 35.8,
                "scale": 2.8
            },
            {
                "lon": 129.3,
                "lat": 35.9,
                "scale": 3.4
            },
            {
                "lon": 127.8,
                "lat": 36.3,
                "scale": 2.7
            },
            {
                "lon": 127,
                "lat": 36.2,
                "scale": 2.9
            },
            {
                "lon": 129.3,
                "lat": 35.9,
                "scale": 3.2
            },
            {
                "lon": 127.3,
                "lat": 36.7,
                "scale": 2.8
            },
            {
                "lon": 128.4,
                "lat": 36,
                "scale": 2.5
            },
            {
                "lon": 128.2,
                "lat": 36.8,
                "scale": 3
            },
            {
                "lon": 128.2,
                "lat": 35.8,
                "scale": 2.1
            },
            {
                "lon": 128.3,
                "lat": 36.6,
                "scale": 2.3
            },
            {
                "lon": 128.1,
                "lat": 35.2,
                "scale": 2.3
            },
            {
                "lon": 128.5,
                "lat": 36.6,
                "scale": 2.7
            },
            {
                "lon": 127.1,
                "lat": 36.2,
                "scale": 2.4
            },
            {
                "lon": 128.4,
                "lat": 36.3,
                "scale": 2.2
            },
            {
                "lon": 127.1,
                "lat": 35.7,
                "scale": 2.4
            },
            {
                "lon": 128.4,
                "lat": 35.6,
                "scale": 2.4
            },
            {
                "lon": 127.2,
                "lat": 36.7,
                "scale": 2
            },
            {
                "lon": 128.8,
                "lat": 37.3,
                "scale": 2.6
            },
            {
                "lon": 126.7,
                "lat": 37.1,
                "scale": 2.7
            },
            {
                "lon": 127.2,
                "lat": 36.2,
                "scale": 2.2
            },
            {
                "lon": 126.9,
                "lat": 34.6,
                "scale": 3.1
            },
            {
                "lon": 127.4,
                "lat": 36.3,
                "scale": 2.7
            },
            {
                "lon": 126.6,
                "lat": 35.7,
                "scale": 3
            },
            {
                "lon": 127.6,
                "lat": 37.1,
                "scale": 2
            },
            {
                "lon": 128.2,
                "lat": 36,
                "scale": 2.2
            },
            {
                "lon": 128.4,
                "lat": 37.4,
                "scale": 2
            },
            {
                "lon": 127.9,
                "lat": 35.3,
                "scale": 2.9
            },
            {
                "lon": 127.8,
                "lat": 35.1,
                "scale": 2.5
            },
            {
                "lon": 127.8,
                "lat": 36.4,
                "scale": 2.1
            },
            {
                "lon": 128.8,
                "lat": 36.7,
                "scale": 2.3
            },
            {
                "lon": 127.3,
                "lat": 34.8,
                "scale": 2.9
            },
            {
                "lon": 127.9,
                "lat": 36,
                "scale": 2.2
            },
            {
                "lon": 127,
                "lat": 36.7,
                "scale": 2.3
            },
            {
                "lon": 128,
                "lat": 36.4,
                "scale": 3.5
            },
            {
                "lon": 127.4,
                "lat": 36.2,
                "scale": 2
            },
            {
                "lon": 128,
                "lat": 36.5,
                "scale": 2.2
            },
            {
                "lon": 128.3,
                "lat": 36.7,
                "scale": 2.3
            },
            {
                "lon": 128.2,
                "lat": 35.9,
                "scale": 3.1
            },
            {
                "lon": 127.4,
                "lat": 34.8,
                "scale": 2.8
            },
            {
                "lon": 127,
                "lat": 36.4,
                "scale": 2.2
            },
            {
                "lon": 126.9,
                "lat": 36.6,
                "scale": 2.6
            },
            {
                "lon": 127.5,
                "lat": 35.5,
                "scale": 2.6
            },
            {
                "lon": 127.7,
                "lat": 36,
                "scale": 2.6
            },
            {
                "lon": 129,
                "lat": 37.1,
                "scale": 2.1
            },
            {
                "lon": 126.9,
                "lat": 34.7,
                "scale": 2.6
            },
            {
                "lon": 128.3,
                "lat": 36.7,
                "scale": 3.5
            },
            {
                "lon": 127.5,
                "lat": 35.9,
                "scale": 2.4
            },
            {
                "lon": 127.4,
                "lat": 34.8,
                "scale": 2.3
            },
            {
                "lon": 128.8,
                "lat": 35.4,
                "scale": 3.1
            },
            {
                "lon": 128.2,
                "lat": 35.8,
                "scale": 2.8
            },
            {
                "lon": 129.2,
                "lat": 36.1,
                "scale": 2.4
            },
            {
                "lon": 128.1,
                "lat": 36.7,
                "scale": 2.1
            },
            {
                "lon": 126.6,
                "lat": 36.5,
                "scale": 3
            },
            {
                "lon": 127.4,
                "lat": 34.9,
                "scale": 2.4
            },
            {
                "lon": 129.2,
                "lat": 37.4,
                "scale": 2.4
            },
            {
                "lon": 127.2,
                "lat": 37.1,
                "scale": 2.4
            },
            {
                "lon": 128.1,
                "lat": 37.3,
                "scale": 2.5
            },
            {
                "lon": 126.6,
                "lat": 34.7,
                "scale": 2
            },
            {
                "lon": 128,
                "lat": 35.8,
                "scale": 2.3
            },
            {
                "lon": 127.4,
                "lat": 34.7,
                "scale": 3
            },
            {
                "lon": 127.6,
                "lat": 35.7,
                "scale": 2.5
            },
            {
                "lon": 128.3,
                "lat": 36.1,
                "scale": 2.8
            },
            {
                "lon": 127.6,
                "lat": 36.6,
                "scale": 2.4
            },
            {
                "lon": 127.6,
                "lat": 36.2,
                "scale": 2.7
            },
            {
                "lon": 127.7,
                "lat": 35.2,
                "scale": 3
            },
            {
                "lon": 128.4,
                "lat": 34.9,
                "scale": 2.8
            },
            {
                "lon": 126.6,
                "lat": 35.1,
                "scale": 2.8
            },
            {
                "lon": 127.7,
                "lat": 36.4,
                "scale": 2.5
            },
            {
                "lon": 127.9,
                "lat": 35.8,
                "scale": 2.4
            },
            {
                "lon": 126.3,
                "lat": 36.7,
                "scale": 2
            },
            {
                "lon": 126.2,
                "lat": 36.7,
                "scale": 2.1
            },
            {
                "lon": 127,
                "lat": 36.5,
                "scale": 2.7
            },
            {
                "lon": 129.2,
                "lat": 35.9,
                "scale": 2.7
            },
            {
                "lon": 129.4,
                "lat": 35.8,
                "scale": 2.8
            },
            {
                "lon": 126.6,
                "lat": 35.3,
                "scale": 2.9
            },
            {
                "lon": 127.9,
                "lat": 36,
                "scale": 2.3
            },
            {
                "lon": 129.3,
                "lat": 35.8,
                "scale": 3
            },
            {
                "lon": 128.4,
                "lat": 36.1,
                "scale": 3.1
            },
            {
                "lon": 128.7,
                "lat": 36.2,
                "scale": 2.1
            },
            {
                "lon": 127.8,
                "lat": 36.4,
                "scale": 2.1
            },
            {
                "lon": 127.3,
                "lat": 36.2,
                "scale": 2.5
            },
            {
                "lon": 127.3,
                "lat": 36.2,
                "scale": 2.9
            },
            {
                "lon": 127.3,
                "lat": 36.2,
                "scale": 2.4
            },
            {
                "lon": 128.2,
                "lat": 34.9,
                "scale": 2.7
            },
            {
                "lon": 128.5,
                "lat": 35.8,
                "scale": 2.3
            },
            {
                "lon": 127.3,
                "lat": 36.3,
                "scale": 2.1
            },
            {
                "lon": 126.5,
                "lat": 37,
                "scale": 3.6
            },
            {
                "lon": 129.4,
                "lat": 35.8,
                "scale": 2
            },
            {
                "lon": 127,
                "lat": 36.2,
                "scale": 2.9
            },
            {
                "lon": 128,
                "lat": 35.4,
                "scale": 2
            },
            {
                "lon": 128.5,
                "lat": 35.9,
                "scale": 2.4
            },
            {
                "lon": 128.9,
                "lat": 37.2,
                "scale": 2.1
            },
            {
                "lon": 128.2,
                "lat": 35.8,
                "scale": 3.9
            },
            {
                "lon": 129.4,
                "lat": 35.8,
                "scale": 2.8
            },
            {
                "lon": 129.3,
                "lat": 37,
                "scale": 2.2
            },
            {
                "lon": 128.7,
                "lat": 37.3,
                "scale": 2.1
            },
            {
                "lon": 127.3,
                "lat": 36.4,
                "scale": 2.1
            },
            {
                "lon": 127.4,
                "lat": 35.9,
                "scale": 3.3
            },
            {
                "lon": 126.2,
                "lat": 33.3,
                "scale": 2.3
            },
            {
                "lon": 126.5,
                "lat": 37.6,
                "scale": 2.7
            },
            {
                "lon": 126.9,
                "lat": 37.5,
                "scale": 2.5
            },
            {
                "lon": 128.3,
                "lat": 35.5,
                "scale": 2.5
            },
            {
                "lon": 128.3,
                "lat": 35.5,
                "scale": 2
            },
            {
                "lon": 128.49,
                "lat": 36.78,
                "scale": 2.3
            },
            {
                "lon": 128.48,
                "lat": 36.77,
                "scale": 2.5
            },
            {
                "lon": 127.84,
                "lat": 37.09,
                "scale": 2.1
            },
            {
                "lon": 127.01,
                "lat": 34.98,
                "scale": 2.7
            },
            {
                "lon": 128.13,
                "lat": 35.98,
                "scale": 2.2
            },
            {
                "lon": 128.8,
                "lat": 37.21,
                "scale": 3.1
            },
            {
                "lon": 127.76,
                "lat": 36.62,
                "scale": 2.5
            },
            {
                "lon": 127.11,
                "lat": 34.76,
                "scale": 2.6
            },
            {
                "lon": 128.8,
                "lat": 37.21,
                "scale": 3.2
            },
            {
                "lon": 128.77,
                "lat": 37.19,
                "scale": 2
            },
            {
                "lon": 127.26,
                "lat": 36.33,
                "scale": 2.1
            },
            {
                "lon": 127.89,
                "lat": 35.8,
                "scale": 2.3
            },
            {
                "lon": 127.66,
                "lat": 36.22,
                "scale": 2.3
            },
            {
                "lon": 127.36,
                "lat": 36.34,
                "scale": 2.9
            },
            {
                "lon": 127.34,
                "lat": 36.33,
                "scale": 2
            },
            {
                "lon": 127.22,
                "lat": 35.38,
                "scale": 2
            },
            {
                "lon": 126.65,
                "lat": 36.13,
                "scale": 2
            },
            {
                "lon": 127.89,
                "lat": 35.79,
                "scale": 2.5
            },
            {
                "lon": 127.88,
                "lat": 35.8,
                "scale": 2
            },
            {
                "lon": 127.82,
                "lat": 35.74,
                "scale": 2
            },
            {
                "lon": 128.81,
                "lat": 37.21,
                "scale": 2.2
            },
            {
                "lon": 127.67,
                "lat": 36.67,
                "scale": 2.2
            },
            {
                "lon": 127.45,
                "lat": 35.97,
                "scale": 2.4
            },
            {
                "lon": 127.92,
                "lat": 36.46,
                "scale": 2.7
            },
            {
                "lon": 128.11,
                "lat": 36.11,
                "scale": 2.2
            },
            {
                "lon": 128.57,
                "lat": 37.69,
                "scale": 2
            },
            {
                "lon": 128.59,
                "lat": 37.68,
                "scale": 4.8
            },
            {
                "lon": 128.85,
                "lat": 37.21,
                "scale": 2
            },
            {
                "lon": 127.97,
                "lat": 36.18,
                "scale": 2.9
            },
            {
                "lon": 126.53,
                "lat": 36.94,
                "scale": 2
            },
            {
                "lon": 127.85,
                "lat": 36.13,
                "scale": 2.2
            },
            {
                "lon": 127.83,
                "lat": 36.6,
                "scale": 2.1
            },
            {
                "lon": 128.01,
                "lat": 35.92,
                "scale": 2.2
            },
            {
                "lon": 129.22,
                "lat": 35.72,
                "scale": 2.5
            },
            {
                "lon": 129,
                "lat": 36.57,
                "scale": 2.4
            },
            {
                "lon": 128.57,
                "lat": 35.23,
                "scale": 2.1
            },
            {
                "lon": 129.01,
                "lat": 37.08,
                "scale": 2.2
            },
            {
                "lon": 126.66,
                "lat": 36.88,
                "scale": 2.6
            },
            {
                "lon": 128.8,
                "lat": 37.23,
                "scale": 2.4
            },
            {
                "lon": 127.74,
                "lat": 36.05,
                "scale": 2.1
            },
            {
                "lon": 128.97,
                "lat": 37.45,
                "scale": 2.9
            },
            {
                "lon": 128.42,
                "lat": 36.62,
                "scale": 2.5
            },
            {
                "lon": 126.48,
                "lat": 34.78,
                "scale": 2.1
            },
            {
                "lon": 127.8,
                "lat": 35.62,
                "scale": 2.2
            },
            {
                "lon": 127.54,
                "lat": 36.19,
                "scale": 2.2
            },
            {
                "lon": 129.33,
                "lat": 35.82,
                "scale": 2.2
            },
            {
                "lon": 126.56,
                "lat": 35.97,
                "scale": 2.5
            },
            {
                "lon": 128.8,
                "lat": 35.66,
                "scale": 2
            },
            {
                "lon": 127.1,
                "lat": 38.11,
                "scale": 2
            },
            {
                "lon": 126.4,
                "lat": 37.78,
                "scale": 2.8
            },
            {
                "lon": 128.6,
                "lat": 35.57,
                "scale": 2.2
            },
            {
                "lon": 128.82,
                "lat": 35.54,
                "scale": 2.3
            },
            {
                "lon": 127.12,
                "lat": 38.08,
                "scale": 2.4
            },
            {
                "lon": 126.99,
                "lat": 35.6,
                "scale": 2.5
            },
            {
                "lon": 127.11,
                "lat": 38.12,
                "scale": 2.1
            },
            {
                "lon": 127.25,
                "lat": 36.35,
                "scale": 3.4
            },
            {
                "lon": 129.11,
                "lat": 37.07,
                "scale": 2.3
            },
            {
                "lon": 129.8,
                "lat": 37.5,
                "scale": 3.7
            },
            {
                "lon": 129.7,
                "lat": 35.6,
                "scale": 3.5
            },
            {
                "lon": 125.8,
                "lat": 38.9,
                "scale": 3
            },
            {
                "lon": 124.6,
                "lat": 35.3,
                "scale": 3
            },
            {
                "lon": 129.6,
                "lat": 37.9,
                "scale": 4.2
            },
            {
                "lon": 126.4,
                "lat": 39.2,
                "scale": 3.1
            },
            {
                "lon": 129.6,
                "lat": 35.9,
                "scale": 2.6
            },
            {
                "lon": 127.3,
                "lat": 34.7,
                "scale": 2.9
            },
            {
                "lon": 130.2,
                "lat": 35.8,
                "scale": 3
            },
            {
                "lon": 125.6,
                "lat": 38.8,
                "scale": 3.1
            },
            {
                "lon": 126,
                "lat": 33.5,
                "scale": 2.5
            },
            {
                "lon": 125.5,
                "lat": 36.4,
                "scale": 3.5
            },
            {
                "lon": 126.3,
                "lat": 39.3,
                "scale": 2.6
            },
            {
                "lon": 125.9,
                "lat": 38.9,
                "scale": 2.8
            },
            {
                "lon": 126.3,
                "lat": 39.5,
                "scale": 2.7
            },
            {
                "lon": 126.3,
                "lat": 38.2,
                "scale": 2.1
            },
            {
                "lon": 123.3,
                "lat": 34.2,
                "scale": 3
            },
            {
                "lon": 129.5,
                "lat": 37.4,
                "scale": 2.7
            },
            {
                "lon": 126,
                "lat": 39,
                "scale": 3.6
            },
            {
                "lon": 129.9,
                "lat": 35.6,
                "scale": 2.4
            },
            {
                "lon": 125.4,
                "lat": 36.7,
                "scale": 3.5
            },
            {
                "lon": 127.6,
                "lat": 39,
                "scale": 3.6
            },
            {
                "lon": 127.2,
                "lat": 32.8,
                "scale": 2.9
            },
            {
                "lon": 125.2,
                "lat": 35,
                "scale": 2.9
            },
            {
                "lon": 128.7,
                "lat": 38.3,
                "scale": 3.2
            },
            {
                "lon": 127.3,
                "lat": 39,
                "scale": 2.8
            },
            {
                "lon": 126,
                "lat": 36.2,
                "scale": 2.5
            },
            {
                "lon": 126,
                "lat": 35.2,
                "scale": 3.2
            },
            {
                "lon": 126,
                "lat": 35.2,
                "scale": 3
            },
            {
                "lon": 126.2,
                "lat": 37.4,
                "scale": 2.8
            },
            {
                "lon": 126.2,
                "lat": 37.4,
                "scale": 2.7
            },
            {
                "lon": 129.7,
                "lat": 37.9,
                "scale": 2.5
            },
            {
                "lon": 125.4,
                "lat": 37.8,
                "scale": 3
            },
            {
                "lon": 129.9,
                "lat": 35.6,
                "scale": 3.9
            },
            {
                "lon": 123.6,
                "lat": 37.8,
                "scale": 4.1
            },
            {
                "lon": 128.5,
                "lat": 38.4,
                "scale": 2.9
            },
            {
                "lon": 126.3,
                "lat": 38.4,
                "scale": 3.5
            },
            {
                "lon": 126.2,
                "lat": 35.5,
                "scale": 2.3
            },
            {
                "lon": 129.7,
                "lat": 37.6,
                "scale": 2.4
            },
            {
                "lon": 123.9,
                "lat": 35.9,
                "scale": 2.9
            },
            {
                "lon": 126,
                "lat": 38.9,
                "scale": 2.8
            },
            {
                "lon": 129,
                "lat": 34.4,
                "scale": 2.8
            },
            {
                "lon": 124.3,
                "lat": 38.5,
                "scale": 3.7
            },
            {
                "lon": 125.2,
                "lat": 36,
                "scale": 2.8
            },
            {
                "lon": 130,
                "lat": 36.7,
                "scale": 2.4
            },
            {
                "lon": 130.1,
                "lat": 36.7,
                "scale": 2.4
            },
            {
                "lon": 126.1,
                "lat": 38.8,
                "scale": 2.7
            },
            {
                "lon": 129.9,
                "lat": 36,
                "scale": 2.7
            },
            {
                "lon": 125.7,
                "lat": 36.6,
                "scale": 3.8
            },
            {
                "lon": 125.5,
                "lat": 36.6,
                "scale": 2.8
            },
            {
                "lon": 128.7,
                "lat": 38.3,
                "scale": 4.2
            },
            {
                "lon": 128.6,
                "lat": 38.3,
                "scale": 2.9
            },
            {
                "lon": 130.3,
                "lat": 37.4,
                "scale": 2.9
            },
            {
                "lon": 127.8,
                "lat": 38.5,
                "scale": 2.9
            },
            {
                "lon": 126,
                "lat": 37.3,
                "scale": 3.5
            },
            {
                "lon": 126.3,
                "lat": 40.5,
                "scale": 3.5
            },
            {
                "lon": 130.4,
                "lat": 37.5,
                "scale": 3.2
            },
            {
                "lon": 130.4,
                "lat": 37.5,
                "scale": 2.7
            },
            {
                "lon": 130.4,
                "lat": 37.5,
                "scale": 2.4
            },
            {
                "lon": 130.2,
                "lat": 37.5,
                "scale": 3
            },
            {
                "lon": 124,
                "lat": 36.4,
                "scale": 3.1
            },
            {
                "lon": 129.4,
                "lat": 37.3,
                "scale": 2.5
            },
            {
                "lon": 130.5,
                "lat": 37.7,
                "scale": 3.1
            },
            {
                "lon": 123.7,
                "lat": 36.2,
                "scale": 3.5
            },
            {
                "lon": 126.2,
                "lat": 35.5,
                "scale": 3.1
            },
            {
                "lon": 125.8,
                "lat": 37.7,
                "scale": 2.6
            },
            {
                "lon": 126.4,
                "lat": 33.2,
                "scale": 2.6
            },
            {
                "lon": 123.7,
                "lat": 36.1,
                "scale": 3.4
            },
            {
                "lon": 128.8,
                "lat": 38.2,
                "scale": 2.7
            },
            {
                "lon": 127.9,
                "lat": 38.7,
                "scale": 3
            },
            {
                "lon": 125.9,
                "lat": 36.3,
                "scale": 2.5
            },
            {
                "lon": 126,
                "lat": 36.5,
                "scale": 2.3
            },
            {
                "lon": 125.3,
                "lat": 36.9,
                "scale": 3.5
            },
            {
                "lon": 125.7,
                "lat": 35.8,
                "scale": 3.3
            },
            {
                "lon": 125.9,
                "lat": 33.3,
                "scale": 3.1
            },
            {
                "lon": 127.8,
                "lat": 38.6,
                "scale": 2.9
            },
            {
                "lon": 127.8,
                "lat": 38.6,
                "scale": 2.9
            },
            {
                "lon": 127.8,
                "lat": 38.5,
                "scale": 3
            },
            {
                "lon": 124.9,
                "lat": 35.1,
                "scale": 2.7
            },
            {
                "lon": 125.9,
                "lat": 35.3,
                "scale": 2.2
            },
            {
                "lon": 125.9,
                "lat": 38.9,
                "scale": 3.4
            },
            {
                "lon": 125.7,
                "lat": 37.7,
                "scale": 2.6
            },
            {
                "lon": 125.8,
                "lat": 38.8,
                "scale": 2.9
            },
            {
                "lon": 130,
                "lat": 36.5,
                "scale": 3.7
            },
            {
                "lon": 127.9,
                "lat": 38.4,
                "scale": 2.3
            },
            {
                "lon": 125.7,
                "lat": 35.3,
                "scale": 2.3
            },
            {
                "lon": 124.6,
                "lat": 37.6,
                "scale": 2.8
            },
            {
                "lon": 129.7,
                "lat": 35.9,
                "scale": 2.2
            },
            {
                "lon": 126.1,
                "lat": 35.4,
                "scale": 2.5
            },
            {
                "lon": 125.3,
                "lat": 35.9,
                "scale": 2.1
            },
            {
                "lon": 124.5,
                "lat": 37.8,
                "scale": 3.3
            },
            {
                "lon": 126.7,
                "lat": 36,
                "scale": 2
            },
            {
                "lon": 126.8,
                "lat": 33.6,
                "scale": 2.6
            },
            {
                "lon": 127.6,
                "lat": 34.1,
                "scale": 2.6
            },
            {
                "lon": 129.7,
                "lat": 35.8,
                "scale": 2.5
            },
            {
                "lon": 126.4,
                "lat": 35.7,
                "scale": 2.3
            },
            {
                "lon": 126.6,
                "lat": 35.8,
                "scale": 3.6
            },
            {
                "lon": 125.5,
                "lat": 34,
                "scale": 2.5
            },
            {
                "lon": 125.9,
                "lat": 35.6,
                "scale": 2.2
            },
            {
                "lon": 129.9,
                "lat": 36.7,
                "scale": 4.1
            },
            {
                "lon": 126.2,
                "lat": 36.2,
                "scale": 2.8
            },
            {
                "lon": 125,
                "lat": 35.1,
                "scale": 2.9
            },
            {
                "lon": 125,
                "lat": 35,
                "scale": 2.6
            },
            {
                "lon": 126.1,
                "lat": 35.5,
                "scale": 2.4
            },
            {
                "lon": 124.3,
                "lat": 38.1,
                "scale": 3.9
            },
            {
                "lon": 124.5,
                "lat": 38.3,
                "scale": 3.5
            },
            {
                "lon": 125,
                "lat": 35.1,
                "scale": 2.4
            },
            {
                "lon": 128.5,
                "lat": 40.5,
                "scale": 3.9
            },
            {
                "lon": 127.9,
                "lat": 34.7,
                "scale": 2.4
            },
            {
                "lon": 125.3,
                "lat": 38.4,
                "scale": 2.8
            },
            {
                "lon": 129.6,
                "lat": 35.9,
                "scale": 3.8
            },
            {
                "lon": 129.8,
                "lat": 35.9,
                "scale": 2.1
            },
            {
                "lon": 124.4,
                "lat": 38,
                "scale": 3.3
            },
            {
                "lon": 123.4,
                "lat": 35.1,
                "scale": 4
            },
            {
                "lon": 125.2,
                "lat": 35.1,
                "scale": 2.7
            },
            {
                "lon": 129.7,
                "lat": 35.9,
                "scale": 2.5
            },
            {
                "lon": 125.4,
                "lat": 35.6,
                "scale": 2.9
            },
            {
                "lon": 126.4,
                "lat": 38.1,
                "scale": 2.4
            },
            {
                "lon": 127.1,
                "lat": 33.9,
                "scale": 2.4
            },
            {
                "lon": 129.4,
                "lat": 37.4,
                "scale": 2.7
            },
            {
                "lon": 127.2,
                "lat": 38.8,
                "scale": 3.8
            },
            {
                "lon": 126.4,
                "lat": 37.1,
                "scale": 2.3
            },
            {
                "lon": 130.2,
                "lat": 36.7,
                "scale": 2.4
            },
            {
                "lon": 126.4,
                "lat": 37.1,
                "scale": 2.1
            },
            {
                "lon": 124.2,
                "lat": 37.4,
                "scale": 3.9
            },
            {
                "lon": 127.3,
                "lat": 33.6,
                "scale": 2.2
            },
            {
                "lon": 124.5,
                "lat": 38,
                "scale": 2.9
            },
            {
                "lon": 124.6,
                "lat": 37.6,
                "scale": 2.5
            },
            {
                "lon": 128.6,
                "lat": 38.3,
                "scale": 2.9
            },
            {
                "lon": 129.6,
                "lat": 36.5,
                "scale": 2.3
            },
            {
                "lon": 124.6,
                "lat": 35,
                "scale": 4.9
            },
            {
                "lon": 123.7,
                "lat": 37.8,
                "scale": 5
            },
            {
                "lon": 126.3,
                "lat": 36.4,
                "scale": 3.3
            },
            {
                "lon": 125.2,
                "lat": 35.2,
                "scale": 2.7
            },
            {
                "lon": 125.1,
                "lat": 36.5,
                "scale": 2.6
            },
            {
                "lon": 123.6,
                "lat": 36,
                "scale": 4
            },
            {
                "lon": 124.8,
                "lat": 35.7,
                "scale": 2.1
            },
            {
                "lon": 125.3,
                "lat": 37.4,
                "scale": 3
            },
            {
                "lon": 124.3,
                "lat": 35,
                "scale": 2.9
            },
            {
                "lon": 124.7,
                "lat": 35.1,
                "scale": 2.7
            },
            {
                "lon": 129.5,
                "lat": 36.8,
                "scale": 2.7
            },
            {
                "lon": 130.3,
                "lat": 34.7,
                "scale": 2.6
            },
            {
                "lon": 124.5,
                "lat": 37.5,
                "scale": 2.9
            },
            {
                "lon": 129.6,
                "lat": 36,
                "scale": 2.5
            },
            {
                "lon": 126.9,
                "lat": 33.2,
                "scale": 2.3
            },
            {
                "lon": 127.5,
                "lat": 34.1,
                "scale": 2.4
            },
            {
                "lon": 125.1,
                "lat": 38.7,
                "scale": 3.2
            },
            {
                "lon": 125.8,
                "lat": 33.7,
                "scale": 2.9
            },
            {
                "lon": 126.1,
                "lat": 38.6,
                "scale": 2.4
            },
            {
                "lon": 125.4,
                "lat": 35.8,
                "scale": 2.9
            },
            {
                "lon": 126,
                "lat": 39.4,
                "scale": 2.9
            },
            {
                "lon": 124.6,
                "lat": 34.9,
                "scale": 2
            },
            {
                "lon": 123.8,
                "lat": 37.4,
                "scale": 2.9
            },
            {
                "lon": 127.3,
                "lat": 33.4,
                "scale": 2.2
            },
            {
                "lon": 127.3,
                "lat": 33.4,
                "scale": 2.2
            },
            {
                "lon": 126,
                "lat": 32.7,
                "scale": 3.1
            },
            {
                "lon": 129.9,
                "lat": 37.5,
                "scale": 2
            },
            {
                "lon": 125.9,
                "lat": 36.4,
                "scale": 2.1
            },
            {
                "lon": 124.9,
                "lat": 39.5,
                "scale": 2.7
            },
            {
                "lon": 130.2,
                "lat": 36.8,
                "scale": 5.2
            },
            {
                "lon": 130,
                "lat": 36.6,
                "scale": 2
            },
            {
                "lon": 130,
                "lat": 37.2,
                "scale": 3.5
            },
            {
                "lon": 126,
                "lat": 38.5,
                "scale": 2.1
            },
            {
                "lon": 127.2,
                "lat": 33.4,
                "scale": 2.6
            },
            {
                "lon": 127.1,
                "lat": 33.4,
                "scale": 2.5
            },
            {
                "lon": 125.4,
                "lat": 38,
                "scale": 2.2
            },
            {
                "lon": 127.3,
                "lat": 33.7,
                "scale": 2.7
            },
            {
                "lon": 125.5,
                "lat": 34.4,
                "scale": 2.7
            },
            {
                "lon": 126.1,
                "lat": 37.1,
                "scale": 2
            },
            {
                "lon": 129.5,
                "lat": 37.6,
                "scale": 2.4
            },
            {
                "lon": 125.7,
                "lat": 33.2,
                "scale": 2.5
            },
            {
                "lon": 125.8,
                "lat": 32.9,
                "scale": 2.3
            },
            {
                "lon": 127.7,
                "lat": 33.6,
                "scale": 2.1
            },
            {
                "lon": 130.39,
                "lat": 38.95,
                "scale": 2.4
            },
            {
                "lon": 126.36,
                "lat": 33.49,
                "scale": 2.5
            },
            {
                "lon": 130.02,
                "lat": 36.59,
                "scale": 2.8
            },
            {
                "lon": 126.22,
                "lat": 35.4,
                "scale": 3.4
            },
            {
                "lon": 127.14,
                "lat": 38.82,
                "scale": 2.4
            },
            {
                "lon": 125.85,
                "lat": 32.47,
                "scale": 3.1
            },
            {
                "lon": 125.57,
                "lat": 36.43,
                "scale": 2.2
            },
            {
                "lon": 126.97,
                "lat": 33.56,
                "scale": 2.4
            },
            {
                "lon": 125.41,
                "lat": 37.17,
                "scale": 2.4
            },
            {
                "lon": 130.03,
                "lat": 35.67,
                "scale": 2.4
            },
            {
                "lon": 125.47,
                "lat": 34.91,
                "scale": 3
            },
            {
                "lon": 122.99,
                "lat": 35.04,
                "scale": 3.6
            },
            {
                "lon": 125.6,
                "lat": 38.13,
                "scale": 2.6
            },
            {
                "lon": 124.76,
                "lat": 37.51,
                "scale": 2.5
            },
            {
                "lon": 126.17,
                "lat": 33.06,
                "scale": 3.9
            },
            {
                "lon": 126.15,
                "lat": 33,
                "scale": 3
            },
            {
                "lon": 125.57,
                "lat": 38.81,
                "scale": 3
            },
            {
                "lon": 129.05,
                "lat": 34.5,
                "scale": 4
            },
            {
                "lon": 129.63,
                "lat": 36.66,
                "scale": 3.1
            },
            {
                "lon": 127.44,
                "lat": 34.16,
                "scale": 3.1
            },
            {
                "lon": 127.03,
                "lat": 34.16,
                "scale": 3.4
            },
            {
                "lon": 126.26,
                "lat": 36.65,
                "scale": 2.4
            },
            {
                "lon": 129.69,
                "lat": 37.13,
                "scale": 2.2
            },
            {
                "lon": 129.58,
                "lat": 35.82,
                "scale": 2.1
            },
            {
                "lon": 124.94,
                "lat": 37.92,
                "scale": 3.5
            },
            {
                "lon": 129.47,
                "lat": 36.94,
                "scale": 2.7
            },
            {
                "lon": 125.05,
                "lat": 37.87,
                "scale": 3.2
            },
            {
                "lon": 123.99,
                "lat": 38.35,
                "scale": 3.1
            },
            {
                "lon": 127.61,
                "lat": 34.64,
                "scale": 2.2
            },
            {
                "lon": 126.03,
                "lat": 38.67,
                "scale": 3
            },
            {
                "lon": 127.15,
                "lat": 33.3,
                "scale": 2.5
            },
            {
                "lon": 126,
                "lat": 37.13,
                "scale": 2.1
            },
            {
                "lon": 125.94,
                "lat": 38.19,
                "scale": 2.4
            },
            {
                "lon": 127.3,
                "lat": 38.33,
                "scale": 2.5
            },
            {
                "lon": 126.26,
                "lat": 35.67,
                "scale": 2.4
            },
            {
                "lon": 125.96,
                "lat": 38.68,
                "scale": 3.3
            },
            {
                "lon": 125.01,
                "lat": 34.74,
                "scale": 2.8
            },
            {
                "lon": 129.93,
                "lat": 37.07,
                "scale": 2.4
            },
            {
                "lon": 129.96,
                "lat": 37.05,
                "scale": 3
            },
            {
                "lon": 129.91,
                "lat": 37.1,
                "scale": 2.5
            },
            {
                "lon": 129.92,
                "lat": 37.1,
                "scale": 2.4
            },
            {
                "lon": 129.82,
                "lat": 37.01,
                "scale": 2.1
            },
            {
                "lon": 129.93,
                "lat": 37.09,
                "scale": 3
            },
            {
                "lon": 129.93,
                "lat": 37.12,
                "scale": 2.5
            },
            {
                "lon": 129.81,
                "lat": 37.07,
                "scale": 2.5
            },
            {
                "lon": 129.93,
                "lat": 37.09,
                "scale": 3.5
            },
            {
                "lon": 129.84,
                "lat": 37.05,
                "scale": 2.5
            },
            {
                "lon": 129.54,
                "lat": 36.22,
                "scale": 2.4
            },
            {
                "lon": 128.16,
                "lat": 34.6,
                "scale": 2.4
            },
            {
                "lon": 126.32,
                "lat": 37.17,
                "scale": 2
            },
            {
                "lon": 124.63,
                "lat": 35.6,
                "scale": 2.8
            },
            {
                "lon": 124.82,
                "lat": 35.7,
                "scale": 2.3
            },
            {
                "lon": 129.56,
                "lat": 35.92,
                "scale": 2.6
            },
            {
                "lon": 128.81,
                "lat": 34.62,
                "scale": 2.1
            },
            {
                "lon": 124.9,
                "lat": 34.1,
                "scale": 3.4
            },
            {
                "lon": 124.88,
                "lat": 37.35,
                "scale": 2.4
            },
            {
                "lon": 125.98,
                "lat": 37.13,
                "scale": 2.2
            },
            {
                "lon": 125.75,
                "lat": 33.36,
                "scale": 2.6
            },
            {
                "lon": 125.12,
                "lat": 38.59,
                "scale": 2.9
            },
            {
                "lon": 127.48,
                "lat": 34.14,
                "scale": 2.4
            },
            {
                "lon": 126.22,
                "lat": 33.06,
                "scale": 2.5
            },
            {
                "lon": 129.9,
                "lat": 37.14,
                "scale": 2.1
            },
            {
                "lon": 127.98,
                "lat": 39.11,
                "scale": 2.4
            },
            {
                "lon": 125.59,
                "lat": 38.62,
                "scale": 2.4
            },
            {
                "lon": 129.68,
                "lat": 34.97,
                "scale": 2.2
            },
            {
                "lon": 125.6,
                "lat": 38.64,
                "scale": 2.8
            },
            {
                "lon": 125.63,
                "lat": 38.58,
                "scale": 2.3
            },
            {
                "lon": 129.91,
                "lat": 35.55,
                "scale": 2.1
            },
            {
                "lon": 125.05,
                "lat": 36.1,
                "scale": 2.5
            },
            {
                "lon": 130.15,
                "lat": 35.61,
                "scale": 2.2
            },
            {
                "lon": 129.66,
                "lat": 37.37,
                "scale": 2.2
            },
            {
                "lon": 126.65,
                "lat": 39.16,
                "scale": 2.1
            },
            {
                "lon": 125.78,
                "lat": 35.99,
                "scale": 2.5
            },
            {
                "lon": 125.64,
                "lat": 38.69,
                "scale": 2.9
            },
            {
                "lon": 129.47,
                "lat": 36.46,
                "scale": 2.7
            },
            {
                "lon": 129.69,
                "lat": 36.45,
                "scale": 3
            },
            {
                "lon": 129.61,
                "lat": 36.45,
                "scale": 2.6
            },
            {
                "lon": 129.54,
                "lat": 36.44,
                "scale": 2.2
            },
            {
                "lon": 129.55,
                "lat": 36.43,
                "scale": 2.9
            },
            {
                "lon": 125.96,
                "lat": 35.59,
                "scale": 2.5
            },
            {
                "lon": 125.76,
                "lat": 38.9,
                "scale": 2.2
            },
            {
                "lon": 129.63,
                "lat": 36.44,
                "scale": 2.1
            },
            {
                "lon": 129.57,
                "lat": 36.43,
                "scale": 2.1
            },
            {
                "lon": 125.5,
                "lat": 38.63,
                "scale": 2.6
            },
            {
                "lon": 129.64,
                "lat": 34.98,
                "scale": 2.7
            },
            {
                "lon": 127.25,
                "lat": 40.41,
                "scale": 3.2
            },
            {
                "lon": 125.06,
                "lat": 35.09,
                "scale": 2.2
            },
            {
                "lon": 125.37,
                "lat": 35.65,
                "scale": 3.9
            },
            {
                "lon": 125.9,
                "lat": 38.41,
                "scale": 2.3
            },
            {
                "lon": 124.85,
                "lat": 37.95,
                "scale": 2.6
            },
            {
                "lon": 126.54,
                "lat": 33.57,
                "scale": 2.4
            },
            {
                "lon": 126.23,
                "lat": 38.75,
                "scale": 3.2
            },
            {
                "lon": 125.84,
                "lat": 38.75,
                "scale": 2.2
            },
            {
                "lon": 124.57,
                "lat": 35.15,
                "scale": 2.7
            },
            {
                "lon": 130.01,
                "lat": 35.85,
                "scale": 2.6
            },
            {
                "lon": 125.69,
                "lat": 33.5,
                "scale": 4.2
            },
            {
                "lon": 124.66,
                "lat": 35.1,
                "scale": 2.3
            },
            {
                "lon": 127.22,
                "lat": 39.26,
                "scale": 2.1
            },
            {
                "lon": 127.19,
                "lat": 39.3,
                "scale": 2.5
            },
            {
                "lon": 129.74,
                "lat": 35.31,
                "scale": 2.5
            },
            {
                "lon": 128.04,
                "lat": 34.49,
                "scale": 3.2
            },
            {
                "lon": 126.03,
                "lat": 39.4,
                "scale": 2.4
            },
            {
                "lon": 128.08,
                "lat": 34.45,
                "scale": 2.2
            },
            {
                "lon": 125.69,
                "lat": 35.72,
                "scale": 2.2
            },
            {
                "lon": 125.04,
                "lat": 35.13,
                "scale": 3
            },
            {
                "lon": 128.25,
                "lat": 34.57,
                "scale": 2.6
            },
            {
                "lon": 125.02,
                "lat": 34.11,
                "scale": 2.8
            },
            {
                "lon": 125.65,
                "lat": 38.54,
                "scale": 3
            },
            {
                "lon": 125.67,
                "lat": 38.55,
                "scale": 3
            },
            {
                "lon": 128.35,
                "lat": 36.31,
                "scale": 2.1
            },
            {
                "lon": 129.08,
                "lat": 36.5,
                "scale": 2.5
            },
            {
                "lon": 127.44,
                "lat": 35.26,
                "scale": 3.2
            },
            {
                "lon": 127.72,
                "lat": 35.85,
                "scale": 2.3
            },
            {
                "lon": 129.36,
                "lat": 36.94,
                "scale": 2.2
            },
            {
                "lon": 127.13,
                "lat": 38.11,
                "scale": 2.9
            },
            {
                "lon": 128.08,
                "lat": 36.21,
                "scale": 2.3
            },
            {
                "lon": 128.21,
                "lat": 35.45,
                "scale": 2
            },
            {
                "lon": 128.71,
                "lat": 36.56,
                "scale": 4
            },
            {
                "lon": 128.71,
                "lat": 36.57,
                "scale": 2.9
            },
            {
                "lon": 127.13,
                "lat": 36.25,
                "scale": 2.2
            },
            {
                "lon": 129.33,
                "lat": 36.95,
                "scale": 2.4
            },
            {
                "lon": 129.22,
                "lat": 36.57,
                "scale": 2.2
            },
            {
                "lon": 128.29,
                "lat": 35.78,
                "scale": 3
            },
            {
                "lon": 126.91,
                "lat": 35.66,
                "scale": 2.4
            },
            {
                "lon": 127.93,
                "lat": 34.81,
                "scale": 2.5
            },
            {
                "lon": 126.95,
                "lat": 36.07,
                "scale": 2.3
            },
            {
                "lon": 128.55,
                "lat": 36.72,
                "scale": 2.8
            },
            {
                "lon": 127.1,
                "lat": 36.76,
                "scale": 2.4
            },
            {
                "lon": 126.52,
                "lat": 36.97,
                "scale": 2.6
            },
            {
                "lon": 128.17,
                "lat": 36.59,
                "scale": 2.1
            },
            {
                "lon": 126.8,
                "lat": 37.45,
                "scale": 3
            },
            {
                "lon": 127.1,
                "lat": 36.75,
                "scale": 2.3
            },
            {
                "lon": 128.75,
                "lat": 36.8,
                "scale": 2.3
            },
            {
                "lon": 128.71,
                "lat": 36.55,
                "scale": 2.1
            },
            {
                "lon": 127.84,
                "lat": 36,
                "scale": 2.2
            },
            {
                "lon": 127.13,
                "lat": 36.47,
                "scale": 2.3
            },
            {
                "lon": 127.26,
                "lat": 36.34,
                "scale": 2.2
            },
            {
                "lon": 129.01,
                "lat": 36.56,
                "scale": 2.8
            },
            {
                "lon": 128.18,
                "lat": 35.85,
                "scale": 2.5
            },
            {
                "lon": 127.39,
                "lat": 34.29,
                "scale": 2.5
            },
            {
                "lon": 126.76,
                "lat": 36.83,
                "scale": 2.7
            },
            {
                "lon": 127.02,
                "lat": 35.18,
                "scale": 2.3
            },
            {
                "lon": 127.15,
                "lat": 36.41,
                "scale": 2
            },
            {
                "lon": 129.06,
                "lat": 37.19,
                "scale": 2.2
            },
            {
                "lon": 127.83,
                "lat": 36.34,
                "scale": 2.8
            },
            {
                "lon": 128.53,
                "lat": 35.77,
                "scale": 2.7
            },
            {
                "lon": 128.75,
                "lat": 35.58,
                "scale": 3.2
            },
            {
                "lon": 127.94,
                "lat": 36.7,
                "scale": 2.9
            },
            {
                "lon": 127.53,
                "lat": 36.05,
                "scale": 2.5
            },
            {
                "lon": 128.39,
                "lat": 35.91,
                "scale": 2.1
            },
            {
                "lon": 128.99,
                "lat": 37.12,
                "scale": 2.3
            },
            {
                "lon": 128.75,
                "lat": 36.79,
                "scale": 2.2
            },
            {
                "lon": 127.91,
                "lat": 36.49,
                "scale": 2.3
            },
            {
                "lon": 126.81,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 127.71,
                "lat": 36.02,
                "scale": 3.9
            },
            {
                "lon": 128.49,
                "lat": 36.23,
                "scale": 2.7
            },
            {
                "lon": 127.61,
                "lat": 35.92,
                "scale": 2.3
            },
            {
                "lon": 127.51,
                "lat": 36.32,
                "scale": 2.1
            },
            {
                "lon": 128.67,
                "lat": 35.87,
                "scale": 2.2
            },
            {
                "lon": 128.31,
                "lat": 36.7,
                "scale": 2.6
            },
            {
                "lon": 129.08,
                "lat": 37.19,
                "scale": 2.2
            },
            {
                "lon": 129.35,
                "lat": 35.72,
                "scale": 2.5
            },
            {
                "lon": 128.71,
                "lat": 35.32,
                "scale": 2.4
            },
            {
                "lon": 126.6,
                "lat": 34.69,
                "scale": 2.3
            },
            {
                "lon": 128.39,
                "lat": 35.82,
                "scale": 2.6
            },
            {
                "lon": 128.68,
                "lat": 36.84,
                "scale": 2.2
            },
            {
                "lon": 127.25,
                "lat": 36.4,
                "scale": 3.1
            },
            {
                "lon": 129.41,
                "lat": 35.82,
                "scale": 2.1
            },
            {
                "lon": 128.73,
                "lat": 36.41,
                "scale": 2.1
            },
            {
                "lon": 128.4,
                "lat": 36.73,
                "scale": 2.4
            },
            {
                "lon": 127.97,
                "lat": 35.22,
                "scale": 3
            },
            {
                "lon": 127.22,
                "lat": 35.72,
                "scale": 2.2
            },
            {
                "lon": 127.73,
                "lat": 36.11,
                "scale": 2.4
            },
            {
                "lon": 128.9,
                "lat": 36.55,
                "scale": 3.1
            },
            {
                "lon": 127.97,
                "lat": 35.77,
                "scale": 3.5
            },
            {
                "lon": 129.13,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 127.44,
                "lat": 36.5,
                "scale": 2.2
            },
            {
                "lon": 126.96,
                "lat": 35.14,
                "scale": 3.2
            },
            {
                "lon": 129.23,
                "lat": 36.55,
                "scale": 2.3
            },
            {
                "lon": 128.23,
                "lat": 35.36,
                "scale": 2.6
            },
            {
                "lon": 128.06,
                "lat": 35.96,
                "scale": 2
            },
            {
                "lon": 126.4,
                "lat": 36.99,
                "scale": 2.1
            },
            {
                "lon": 128.11,
                "lat": 37.12,
                "scale": 2.1
            },
            {
                "lon": 128.72,
                "lat": 35.64,
                "scale": 2.5
            },
            {
                "lon": 129.04,
                "lat": 36.1,
                "scale": 2.5
            },
            {
                "lon": 127.11,
                "lat": 38.11,
                "scale": 2.9
            },
            {
                "lon": 128.8,
                "lat": 36.23,
                "scale": 2.2
            },
            {
                "lon": 127.75,
                "lat": 35.05,
                "scale": 2.7
            },
            {
                "lon": 128.47,
                "lat": 35.86,
                "scale": 2.7
            },
            {
                "lon": 127.93,
                "lat": 36.47,
                "scale": 3
            },
            {
                "lon": 126.9,
                "lat": 33.52,
                "scale": 2.6
            },
            {
                "lon": 128.04,
                "lat": 35.97,
                "scale": 2.9
            },
            {
                "lon": 127.93,
                "lat": 36.46,
                "scale": 2.7
            },
            {
                "lon": 128.62,
                "lat": 35.97,
                "scale": 2.3
            },
            {
                "lon": 128.66,
                "lat": 35.91,
                "scale": 2.1
            },
            {
                "lon": 127.2,
                "lat": 37.4,
                "scale": 2.2
            },
            {
                "lon": 129.38,
                "lat": 35.68,
                "scale": 2.2
            },
            {
                "lon": 129.41,
                "lat": 35.8,
                "scale": 3.5
            },
            {
                "lon": 126.44,
                "lat": 37.24,
                "scale": 3.2
            },
            {
                "lon": 128.19,
                "lat": 36.44,
                "scale": 2.6
            },
            {
                "lon": 127.17,
                "lat": 34.75,
                "scale": 3.3
            },
            {
                "lon": 127.33,
                "lat": 35.89,
                "scale": 2.1
            },
            {
                "lon": 127.65,
                "lat": 36.43,
                "scale": 2.7
            },
            {
                "lon": 127.24,
                "lat": 36.35,
                "scale": 2.4
            },
            {
                "lon": 128.18,
                "lat": 36.32,
                "scale": 2.1
            },
            {
                "lon": 128.08,
                "lat": 36.07,
                "scale": 2.3
            },
            {
                "lon": 127.98,
                "lat": 35.15,
                "scale": 2.2
            },
            {
                "lon": 127.45,
                "lat": 35.32,
                "scale": 2.2
            },
            {
                "lon": 128.44,
                "lat": 37.19,
                "scale": 2.1
            },
            {
                "lon": 127.5,
                "lat": 37.17,
                "scale": 2.2
            },
            {
                "lon": 129.14,
                "lat": 35.78,
                "scale": 2.5
            },
            {
                "lon": 129.14,
                "lat": 35.78,
                "scale": 2.1
            },
            {
                "lon": 129.37,
                "lat": 35.74,
                "scale": 2.9
            },
            {
                "lon": 129.42,
                "lat": 35.8,
                "scale": 2.6
            },
            {
                "lon": 126.58,
                "lat": 36.9,
                "scale": 2.1
            },
            {
                "lon": 126.95,
                "lat": 36.02,
                "scale": 3.9
            },
            {
                "lon": 128.07,
                "lat": 36.01,
                "scale": 3
            },
            {
                "lon": 128.69,
                "lat": 36.22,
                "scale": 2.3
            },
            {
                "lon": 127.48,
                "lat": 36.21,
                "scale": 3.1
            },
            {
                "lon": 127.2,
                "lat": 36.35,
                "scale": 2.7
            },
            {
                "lon": 128.21,
                "lat": 36.31,
                "scale": 2.7
            },
            {
                "lon": 127.96,
                "lat": 35.22,
                "scale": 2.9
            },
            {
                "lon": 127.93,
                "lat": 35.92,
                "scale": 2.1
            },
            {
                "lon": 128.34,
                "lat": 35.57,
                "scale": 2.3
            },
            {
                "lon": 128.56,
                "lat": 35.42,
                "scale": 2.4
            },
            {
                "lon": 129.02,
                "lat": 37.11,
                "scale": 2.4
            },
            {
                "lon": 127.92,
                "lat": 36.39,
                "scale": 3
            },
            {
                "lon": 128.53,
                "lat": 36.8,
                "scale": 2
            },
            {
                "lon": 128.84,
                "lat": 36.75,
                "scale": 2.4
            },
            {
                "lon": 127.48,
                "lat": 35.65,
                "scale": 2.1
            },
            {
                "lon": 128.03,
                "lat": 35.55,
                "scale": 2.6
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 5.1
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 2.4
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 3.1
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.16,
                "lat": 35.78,
                "scale": 2.4
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.5
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.6
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.7
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.7
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 3.1
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.2,
                "lat": 35.77,
                "scale": 2.5
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 5.8
            },
            {
                "lon": 129.19,
                "lat": 35.78,
                "scale": 3.6
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 3.4
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 3
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 3
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 3
            },
            {
                "lon": 129.2,
                "lat": 35.79,
                "scale": 2.5
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.5
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 2.7
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.23,
                "lat": 35.81,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.9
            },
            {
                "lon": 129.16,
                "lat": 35.75,
                "scale": 2.6
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.5
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.78,
                "scale": 2.8
            },
            {
                "lon": 129.02,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.6
            },
            {
                "lon": 129.16,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.5
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 125.66,
                "lat": 38.56,
                "scale": 2.5
            },
            {
                "lon": 129.56,
                "lat": 36.45,
                "scale": 2.4
            },
            {
                "lon": 125.02,
                "lat": 37.79,
                "scale": 2.3
            },
            {
                "lon": 124.62,
                "lat": 35.14,
                "scale": 2.4
            },
            {
                "lon": 126.87,
                "lat": 40.38,
                "scale": 2.7
            },
            {
                "lon": 129.66,
                "lat": 36.47,
                "scale": 2.3
            },
            {
                "lon": 129.68,
                "lat": 36.49,
                "scale": 3.5
            },
            {
                "lon": 129.83,
                "lat": 37.36,
                "scale": 2.2
            },
            {
                "lon": 126.34,
                "lat": 35.67,
                "scale": 2.2
            },
            {
                "lon": 127.67,
                "lat": 33.94,
                "scale": 2.2
            },
            {
                "lon": 127.31,
                "lat": 33.47,
                "scale": 2.1
            },
            {
                "lon": 125.82,
                "lat": 38.73,
                "scale": 3.2
            },
            {
                "lon": 129.64,
                "lat": 36.47,
                "scale": 3
            },
            {
                "lon": 125.71,
                "lat": 35.76,
                "scale": 3
            },
            {
                "lon": 126.89,
                "lat": 39.72,
                "scale": 2.3
            },
            {
                "lon": 126.01,
                "lat": 37.13,
                "scale": 2.8
            },
            {
                "lon": 129.59,
                "lat": 35.03,
                "scale": 2.7
            },
            {
                "lon": 124.65,
                "lat": 37.08,
                "scale": 3.4
            },
            {
                "lon": 127.14,
                "lat": 33.38,
                "scale": 2.3
            },
            {
                "lon": 125.95,
                "lat": 37.6,
                "scale": 3
            },
            {
                "lon": 125.65,
                "lat": 38.45,
                "scale": 2.5
            },
            {
                "lon": 127.07,
                "lat": 33.39,
                "scale": 2.5
            },
            {
                "lon": 127.36,
                "lat": 33.43,
                "scale": 2.9
            },
            {
                "lon": 126.41,
                "lat": 36.59,
                "scale": 2.4
            },
            {
                "lon": 125.85,
                "lat": 33.52,
                "scale": 2.5
            },
            {
                "lon": 126.43,
                "lat": 38.6,
                "scale": 2.3
            },
            {
                "lon": 126.33,
                "lat": 33.19,
                "scale": 2.4
            },
            {
                "lon": 126.5,
                "lat": 38.57,
                "scale": 2.9
            },
            {
                "lon": 127.44,
                "lat": 38.63,
                "scale": 2.8
            },
            {
                "lon": 125.06,
                "lat": 35.09,
                "scale": 2.4
            },
            {
                "lon": 124.74,
                "lat": 37.09,
                "scale": 2.9
            },
            {
                "lon": 126.62,
                "lat": 38.03,
                "scale": 2.2
            },
            {
                "lon": 126.11,
                "lat": 39.43,
                "scale": 2.2
            },
            {
                "lon": 126,
                "lat": 37.14,
                "scale": 2.7
            },
            {
                "lon": 124.94,
                "lat": 37.84,
                "scale": 2.6
            },
            {
                "lon": 125.1,
                "lat": 35.14,
                "scale": 3
            },
            {
                "lon": 126.15,
                "lat": 38.45,
                "scale": 2.5
            },
            {
                "lon": 126.29,
                "lat": 35.85,
                "scale": 2.6
            },
            {
                "lon": 129.61,
                "lat": 36.52,
                "scale": 2.6
            },
            {
                "lon": 129.6,
                "lat": 36.54,
                "scale": 2.4
            },
            {
                "lon": 125.79,
                "lat": 38.82,
                "scale": 3.8
            },
            {
                "lon": 124.68,
                "lat": 37.68,
                "scale": 2.4
            },
            {
                "lon": 126.02,
                "lat": 38.12,
                "scale": 2.9
            },
            {
                "lon": 126.05,
                "lat": 39.38,
                "scale": 2.5
            },
            {
                "lon": 127.29,
                "lat": 33.4,
                "scale": 2.3
            },
            {
                "lon": 124.87,
                "lat": 38.42,
                "scale": 2.7
            },
            {
                "lon": 129.58,
                "lat": 37.69,
                "scale": 2.4
            },
            {
                "lon": 125.64,
                "lat": 33.69,
                "scale": 2.8
            },
            {
                "lon": 125.94,
                "lat": 38.8,
                "scale": 2.3
            },
            {
                "lon": 124.91,
                "lat": 37.87,
                "scale": 2.2
            },
            {
                "lon": 126.07,
                "lat": 38.8,
                "scale": 2.1
            },
            {
                "lon": 127.14,
                "lat": 33.3,
                "scale": 2.3
            },
            {
                "lon": 127.18,
                "lat": 33.34,
                "scale": 2.4
            },
            {
                "lon": 127.19,
                "lat": 33.33,
                "scale": 2.6
            },
            {
                "lon": 129.95,
                "lat": 35.63,
                "scale": 3.3
            },
            {
                "lon": 127.17,
                "lat": 33.29,
                "scale": 3
            },
            {
                "lon": 125.62,
                "lat": 38.41,
                "scale": 2.2
            },
            {
                "lon": 125.75,
                "lat": 36.42,
                "scale": 3.2
            },
            {
                "lon": 126.06,
                "lat": 38.51,
                "scale": 2.3
            },
            {
                "lon": 125.66,
                "lat": 34.12,
                "scale": 2.2
            },
            {
                "lon": 125.44,
                "lat": 34.02,
                "scale": 2.5
            },
            {
                "lon": 126.01,
                "lat": 38.78,
                "scale": 2.2
            },
            {
                "lon": 129.68,
                "lat": 37.6,
                "scale": 2.4
            },
            {
                "lon": 126.07,
                "lat": 38.78,
                "scale": 2.1
            },
            {
                "lon": 125.64,
                "lat": 38.46,
                "scale": 2.6
            },
            {
                "lon": 125.88,
                "lat": 32.35,
                "scale": 2.7
            },
            {
                "lon": 126.03,
                "lat": 38.75,
                "scale": 2.1
            },
            {
                "lon": 125.9,
                "lat": 38.71,
                "scale": 2.5
            },
            {
                "lon": 126.27,
                "lat": 32.9,
                "scale": 3.2
            },
            {
                "lon": 127.34,
                "lat": 33.41,
                "scale": 2.5
            },
            {
                "lon": 129.7,
                "lat": 37.67,
                "scale": 2.8
            },
            {
                "lon": 129.79,
                "lat": 35.87,
                "scale": 2.8
            },
            {
                "lon": 129.73,
                "lat": 37.14,
                "scale": 2.3
            },
            {
                "lon": 126.7,
                "lat": 39.77,
                "scale": 2.4
            },
            {
                "lon": 128.28,
                "lat": 40.15,
                "scale": 2.8
            },
            {
                "lon": 129.79,
                "lat": 35.95,
                "scale": 2.8
            },
            {
                "lon": 129.38,
                "lat": 37.31,
                "scale": 2.6
            },
            {
                "lon": 125.5,
                "lat": 36.93,
                "scale": 2.2
            },
            {
                "lon": 127.38,
                "lat": 33.7,
                "scale": 2.2
            },
            {
                "lon": 127.33,
                "lat": 33.4,
                "scale": 2.7
            },
            {
                "lon": 125.9,
                "lat": 33.65,
                "scale": 3.5
            },
            {
                "lon": 125.67,
                "lat": 38.66,
                "scale": 2.9
            },
            {
                "lon": 127.57,
                "lat": 38.51,
                "scale": 2.5
            },
            {
                "lon": 125.27,
                "lat": 37,
                "scale": 2.6
            },
            {
                "lon": 125.33,
                "lat": 37.5,
                "scale": 2.3
            },
            {
                "lon": 126.1,
                "lat": 34.62,
                "scale": 2.9
            },
            {
                "lon": 129.95,
                "lat": 35.97,
                "scale": 3.2
            },
            {
                "lon": 129.07,
                "lat": 37.72,
                "scale": 3.1
            },
            {
                "lon": 125.87,
                "lat": 39.13,
                "scale": 2.8
            },
            {
                "lon": 125.01,
                "lat": 37.85,
                "scale": 3.1
            },
            {
                "lon": 126.22,
                "lat": 39.33,
                "scale": 2.2
            },
            {
                "lon": 127.28,
                "lat": 33.61,
                "scale": 2.3
            },
            {
                "lon": 129.69,
                "lat": 35.93,
                "scale": 2.5
            },
            {
                "lon": 127.26,
                "lat": 33.59,
                "scale": 2.9
            },
            {
                "lon": 125.3,
                "lat": 35.08,
                "scale": 3
            },
            {
                "lon": 129.7,
                "lat": 35.91,
                "scale": 2.6
            },
            {
                "lon": 127.81,
                "lat": 33.71,
                "scale": 3.7
            },
            {
                "lon": 127.27,
                "lat": 33.62,
                "scale": 2.8
            },
            {
                "lon": 124.81,
                "lat": 37.89,
                "scale": 4
            },
            {
                "lon": 124.81,
                "lat": 37.9,
                "scale": 2.4
            },
            {
                "lon": 126.14,
                "lat": 35.52,
                "scale": 2.9
            },
            {
                "lon": 126.36,
                "lat": 38.58,
                "scale": 2.3
            },
            {
                "lon": 124.67,
                "lat": 37.89,
                "scale": 2.4
            },
            {
                "lon": 129.56,
                "lat": 36.55,
                "scale": 2.8
            },
            {
                "lon": 129.7,
                "lat": 35.9,
                "scale": 2.2
            },
            {
                "lon": 129.76,
                "lat": 35.66,
                "scale": 2.5
            },
            {
                "lon": 125.63,
                "lat": 38.47,
                "scale": 3.2
            },
            {
                "lon": 124.46,
                "lat": 37.5,
                "scale": 3
            },
            {
                "lon": 127.83,
                "lat": 38.46,
                "scale": 2.2
            },
            {
                "lon": 129.75,
                "lat": 35.7,
                "scale": 2.6
            },
            {
                "lon": 126,
                "lat": 38.82,
                "scale": 3.2
            },
            {
                "lon": 125.21,
                "lat": 35.91,
                "scale": 2.6
            },
            {
                "lon": 125.9,
                "lat": 35.58,
                "scale": 2.6
            },
            {
                "lon": 128.12,
                "lat": 34.58,
                "scale": 3.3
            },
            {
                "lon": 126.26,
                "lat": 38.48,
                "scale": 2.6
            },
            {
                "lon": 127.19,
                "lat": 33.34,
                "scale": 2.7
            },
            {
                "lon": 130.65,
                "lat": 35.54,
                "scale": 3
            },
            {
                "lon": 127.67,
                "lat": 34.23,
                "scale": 2.2
            },
            {
                "lon": 126.53,
                "lat": 35.98,
                "scale": 2.5
            },
            {
                "lon": 125.82,
                "lat": 37.97,
                "scale": 2
            },
            {
                "lon": 129.94,
                "lat": 36.86,
                "scale": 3.3
            },
            {
                "lon": 125.82,
                "lat": 39.02,
                "scale": 2
            },
            {
                "lon": 126.23,
                "lat": 38.51,
                "scale": 2.7
            },
            {
                "lon": 125.96,
                "lat": 37.12,
                "scale": 2.2
            },
            {
                "lon": 129.89,
                "lat": 35.13,
                "scale": 2.7
            },
            {
                "lon": 129.8,
                "lat": 35.13,
                "scale": 2.5
            },
            {
                "lon": 129.85,
                "lat": 35.13,
                "scale": 2.4
            },
            {
                "lon": 129.93,
                "lat": 35.2,
                "scale": 3.2
            },
            {
                "lon": 129.85,
                "lat": 35.15,
                "scale": 2.5
            },
            {
                "lon": 130.24,
                "lat": 36.9,
                "scale": 2.5
            },
            {
                "lon": 125.95,
                "lat": 35.34,
                "scale": 2.2
            },
            {
                "lon": 126.51,
                "lat": 35.72,
                "scale": 2.6
            },
            {
                "lon": 127.26,
                "lat": 33.43,
                "scale": 3.1
            },
            {
                "lon": 126.04,
                "lat": 33.69,
                "scale": 3.4
            },
            {
                "lon": 129.62,
                "lat": 35.92,
                "scale": 2.9
            },
            {
                "lon": 129.57,
                "lat": 36.57,
                "scale": 3.4
            },
            {
                "lon": 125.96,
                "lat": 37.12,
                "scale": 2.6
            },
            {
                "lon": 126.16,
                "lat": 38.43,
                "scale": 2.1
            },
            {
                "lon": 125.72,
                "lat": 38.77,
                "scale": 2.1
            },
            {
                "lon": 125.27,
                "lat": 37.33,
                "scale": 2.4
            },
            {
                "lon": 126.92,
                "lat": 39.72,
                "scale": 2.1
            },
            {
                "lon": 125.93,
                "lat": 33.48,
                "scale": 3.1
            },
            {
                "lon": 124.56,
                "lat": 37.53,
                "scale": 2.1
            },
            {
                "lon": 125.27,
                "lat": 36.9,
                "scale": 2.5
            },
            {
                "lon": 125.28,
                "lat": 36.87,
                "scale": 2.1
            },
            {
                "lon": 124.97,
                "lat": 33.78,
                "scale": 2.6
            },
            {
                "lon": 125.45,
                "lat": 37.98,
                "scale": 3.4
            },
            {
                "lon": 126.02,
                "lat": 32.85,
                "scale": 2.7
            },
            {
                "lon": 125.26,
                "lat": 36.2,
                "scale": 2.2
            },
            {
                "lon": 125.81,
                "lat": 33.53,
                "scale": 2.7
            },
            {
                "lon": 128.72,
                "lat": 34.71,
                "scale": 2.1
            },
            {
                "lon": 128.75,
                "lat": 34.66,
                "scale": 2.2
            },
            {
                "lon": 129.82,
                "lat": 35.61,
                "scale": 2.4
            },
            {
                "lon": 125.48,
                "lat": 38.73,
                "scale": 2.5
            },
            {
                "lon": 126.08,
                "lat": 35.4,
                "scale": 2.7
            },
            {
                "lon": 124.84,
                "lat": 37.54,
                "scale": 2.5
            },
            {
                "lon": 127.27,
                "lat": 33.37,
                "scale": 2.5
            },
            {
                "lon": 129.73,
                "lat": 36.59,
                "scale": 2.8
            },
            {
                "lon": 129.29,
                "lat": 38.2,
                "scale": 2.3
            },
            {
                "lon": 129.61,
                "lat": 36.56,
                "scale": 2.3
            },
            {
                "lon": 129.6,
                "lat": 36.55,
                "scale": 2.2
            },
            {
                "lon": 124.56,
                "lat": 35.16,
                "scale": 4.9
            },
            {
                "lon": 124.49,
                "lat": 35.14,
                "scale": 2.7
            },
            {
                "lon": 127.29,
                "lat": 33.65,
                "scale": 2.7
            },
            {
                "lon": 129.61,
                "lat": 36.47,
                "scale": 2.5
            },
            {
                "lon": 129.63,
                "lat": 36.46,
                "scale": 2
            },
            {
                "lon": 124.79,
                "lat": 37.7,
                "scale": 2.8
            },
            {
                "lon": 124.68,
                "lat": 37.71,
                "scale": 2.7
            },
            {
                "lon": 124.74,
                "lat": 37.69,
                "scale": 2.8
            },
            {
                "lon": 124.6,
                "lat": 37.68,
                "scale": 3.5
            },
            {
                "lon": 124.63,
                "lat": 37.68,
                "scale": 4.9
            },
            {
                "lon": 124.65,
                "lat": 37.69,
                "scale": 2.2
            },
            {
                "lon": 124.66,
                "lat": 37.67,
                "scale": 3.3
            },
            {
                "lon": 124.65,
                "lat": 37.69,
                "scale": 2.5
            },
            {
                "lon": 124.62,
                "lat": 37.67,
                "scale": 2.4
            },
            {
                "lon": 124.57,
                "lat": 37.64,
                "scale": 2.5
            },
            {
                "lon": 124.61,
                "lat": 37.67,
                "scale": 3.9
            },
            {
                "lon": 124.68,
                "lat": 37.71,
                "scale": 2.6
            },
            {
                "lon": 124.61,
                "lat": 37.69,
                "scale": 2.1
            },
            {
                "lon": 124.74,
                "lat": 37.73,
                "scale": 2.3
            },
            {
                "lon": 124.71,
                "lat": 37.66,
                "scale": 3.7
            },
            {
                "lon": 128.81,
                "lat": 38.75,
                "scale": 2.1
            },
            {
                "lon": 126.18,
                "lat": 36.23,
                "scale": 2.6
            },
            {
                "lon": 124.7,
                "lat": 37.71,
                "scale": 2.1
            },
            {
                "lon": 126.15,
                "lat": 36.19,
                "scale": 2.1
            },
            {
                "lon": 126.16,
                "lat": 36.2,
                "scale": 2.5
            },
            {
                "lon": 126.17,
                "lat": 36.2,
                "scale": 2.4
            },
            {
                "lon": 126.18,
                "lat": 36.21,
                "scale": 2.3
            },
            {
                "lon": 126.16,
                "lat": 36.2,
                "scale": 2.3
            },
            {
                "lon": 126.16,
                "lat": 36.19,
                "scale": 2.6
            },
            {
                "lon": 125.95,
                "lat": 39.23,
                "scale": 2.4
            },
            {
                "lon": 126.14,
                "lat": 36.19,
                "scale": 2.2
            },
            {
                "lon": 126.19,
                "lat": 36.2,
                "scale": 2.4
            },
            {
                "lon": 126.17,
                "lat": 36.2,
                "scale": 2.5
            },
            {
                "lon": 126.16,
                "lat": 36.19,
                "scale": 2.8
            },
            {
                "lon": 126.17,
                "lat": 36.2,
                "scale": 2.3
            },
            {
                "lon": 126.17,
                "lat": 36.2,
                "scale": 2.3
            },
            {
                "lon": 129.75,
                "lat": 38.04,
                "scale": 2.1
            },
            {
                "lon": 126.14,
                "lat": 36.2,
                "scale": 2.5
            },
            {
                "lon": 126.17,
                "lat": 36.2,
                "scale": 2.3
            },
            {
                "lon": 126.36,
                "lat": 38.78,
                "scale": 3
            },
            {
                "lon": 126.18,
                "lat": 36.2,
                "scale": 3.5
            },
            {
                "lon": 125.68,
                "lat": 33.03,
                "scale": 2.4
            },
            {
                "lon": 126.15,
                "lat": 36.2,
                "scale": 2.5
            },
            {
                "lon": 126.16,
                "lat": 36.19,
                "scale": 2.7
            },
            {
                "lon": 126.14,
                "lat": 36.19,
                "scale": 2.2
            },
            {
                "lon": 126.14,
                "lat": 36.2,
                "scale": 2.8
            },
            {
                "lon": 126.13,
                "lat": 36.2,
                "scale": 2.7
            },
            {
                "lon": 126.14,
                "lat": 36.21,
                "scale": 2.7
            },
            {
                "lon": 126.17,
                "lat": 36.21,
                "scale": 2.2
            },
            {
                "lon": 126.17,
                "lat": 36.2,
                "scale": 2.2
            },
            {
                "lon": 126.18,
                "lat": 36.21,
                "scale": 3.2
            },
            {
                "lon": 126.22,
                "lat": 36.23,
                "scale": 2.8
            },
            {
                "lon": 126.17,
                "lat": 36.19,
                "scale": 3.1
            },
            {
                "lon": 126.16,
                "lat": 36.2,
                "scale": 2.3
            },
            {
                "lon": 126.08,
                "lat": 36.19,
                "scale": 2
            },
            {
                "lon": 129.75,
                "lat": 35.9,
                "scale": 2.6
            },
            {
                "lon": 126.13,
                "lat": 38.48,
                "scale": 2.3
            },
            {
                "lon": 129.75,
                "lat": 35.66,
                "scale": 3.1
            },
            {
                "lon": 129.77,
                "lat": 35.66,
                "scale": 2.3
            },
            {
                "lon": 129.44,
                "lat": 36.92,
                "scale": 2.1
            },
            {
                "lon": 129.44,
                "lat": 36.91,
                "scale": 3
            },
            {
                "lon": 129.3,
                "lat": 38.19,
                "scale": 2.5
            },
            {
                "lon": 125.39,
                "lat": 33.56,
                "scale": 4
            },
            {
                "lon": 126.16,
                "lat": 36.2,
                "scale": 2.2
            },
            {
                "lon": 129.61,
                "lat": 36.46,
                "scale": 3.6
            },
            {
                "lon": 124.61,
                "lat": 37.96,
                "scale": 2.7
            },
            {
                "lon": 126.36,
                "lat": 36.23,
                "scale": 2.6
            },
            {
                "lon": 126.36,
                "lat": 36.24,
                "scale": 3
            },
            {
                "lon": 124.67,
                "lat": 37.66,
                "scale": 2
            },
            {
                "lon": 125.66,
                "lat": 38.51,
                "scale": 2.1
            },
            {
                "lon": 126.17,
                "lat": 38.47,
                "scale": 2.1
            },
            {
                "lon": 126.1,
                "lat": 38.56,
                "scale": 2.8
            },
            {
                "lon": 125.69,
                "lat": 38.71,
                "scale": 2.4
            },
            {
                "lon": 125.09,
                "lat": 33.44,
                "scale": 2.8
            },
            {
                "lon": 124.4,
                "lat": 38.26,
                "scale": 2.8
            },
            {
                "lon": 124.27,
                "lat": 38.31,
                "scale": 2.6
            },
            {
                "lon": 125.01,
                "lat": 38.74,
                "scale": 2.4
            },
            {
                "lon": 126.09,
                "lat": 39.41,
                "scale": 2.5
            },
            {
                "lon": 124.5,
                "lat": 36.95,
                "scale": 5.1
            },
            {
                "lon": 124.5,
                "lat": 36.95,
                "scale": 2.3
            },
            {
                "lon": 124.44,
                "lat": 36.96,
                "scale": 2.7
            },
            {
                "lon": 124.52,
                "lat": 36.93,
                "scale": 2.9
            },
            {
                "lon": 126.21,
                "lat": 33,
                "scale": 3.4
            },
            {
                "lon": 125.96,
                "lat": 33.52,
                "scale": 2.6
            },
            {
                "lon": 125.89,
                "lat": 38.77,
                "scale": 2.6
            },
            {
                "lon": 129.76,
                "lat": 35.66,
                "scale": 3.5
            },
            {
                "lon": 129.82,
                "lat": 35.66,
                "scale": 2.6
            },
            {
                "lon": 129.81,
                "lat": 35.65,
                "scale": 2.5
            },
            {
                "lon": 129.78,
                "lat": 35.66,
                "scale": 2.9
            },
            {
                "lon": 125.41,
                "lat": 34.51,
                "scale": 2.2
            },
            {
                "lon": 127.2,
                "lat": 40.11,
                "scale": 2.5
            },
            {
                "lon": 126.63,
                "lat": 38.15,
                "scale": 2.4
            },
            {
                "lon": 126.58,
                "lat": 33.59,
                "scale": 2.1
            },
            {
                "lon": 125.64,
                "lat": 36.57,
                "scale": 2.1
            },
            {
                "lon": 127.83,
                "lat": 33.87,
                "scale": 2.7
            },
            {
                "lon": 129.94,
                "lat": 35.07,
                "scale": 3.8
            },
            {
                "lon": 125.45,
                "lat": 36.67,
                "scale": 2.2
            },
            {
                "lon": 125.96,
                "lat": 33.3,
                "scale": 2.9
            },
            {
                "lon": 129.43,
                "lat": 37.73,
                "scale": 2.3
            },
            {
                "lon": 125.88,
                "lat": 33.68,
                "scale": 2.2
            },
            {
                "lon": 129.49,
                "lat": 35.21,
                "scale": 2.3
            },
            {
                "lon": 125.34,
                "lat": 38,
                "scale": 2.2
            },
            {
                "lon": 126.44,
                "lat": 37.23,
                "scale": 2.5
            },
            {
                "lon": 125.89,
                "lat": 33.34,
                "scale": 2.3
            },
            {
                "lon": 126.36,
                "lat": 38.77,
                "scale": 2.5
            },
            {
                "lon": 126.52,
                "lat": 39.09,
                "scale": 2.1
            },
            {
                "lon": 124.79,
                "lat": 35.21,
                "scale": 2.6
            },
            {
                "lon": 126.28,
                "lat": 38.43,
                "scale": 2.8
            },
            {
                "lon": 125.63,
                "lat": 37.51,
                "scale": 3.5
            },
            {
                "lon": 129.45,
                "lat": 36.6,
                "scale": 2.2
            },
            {
                "lon": 127.57,
                "lat": 33.61,
                "scale": 2.1
            },
            {
                "lon": 125.05,
                "lat": 36.09,
                "scale": 2.1
            },
            {
                "lon": 126.25,
                "lat": 32.96,
                "scale": 2.7
            },
            {
                "lon": 125.15,
                "lat": 37.36,
                "scale": 2.7
            },
            {
                "lon": 128.37,
                "lat": 34.16,
                "scale": 2.2
            },
            {
                "lon": 125.47,
                "lat": 37.18,
                "scale": 3.3
            },
            {
                "lon": 129.93,
                "lat": 35.14,
                "scale": 2.9
            },
            {
                "lon": 129.75,
                "lat": 35.88,
                "scale": 2.1
            },
            {
                "lon": 129.69,
                "lat": 35.88,
                "scale": 2.3
            },
            {
                "lon": 129.98,
                "lat": 36.76,
                "scale": 2
            },
            {
                "lon": 126.16,
                "lat": 33.79,
                "scale": 2.1
            },
            {
                "lon": 125.57,
                "lat": 38.41,
                "scale": 2.3
            },
            {
                "lon": 125,
                "lat": 35.85,
                "scale": 2.6
            },
            {
                "lon": 125.86,
                "lat": 37.63,
                "scale": 2
            },
            {
                "lon": 127.01,
                "lat": 33.24,
                "scale": 2.8
            },
            {
                "lon": 127.21,
                "lat": 33.26,
                "scale": 2.2
            },
            {
                "lon": 127.05,
                "lat": 33.22,
                "scale": 2.6
            },
            {
                "lon": 127.06,
                "lat": 33.26,
                "scale": 3.7
            },
            {
                "lon": 125.38,
                "lat": 37.2,
                "scale": 2.5
            },
            {
                "lon": 129.77,
                "lat": 36.38,
                "scale": 2.5
            },
            {
                "lon": 126.53,
                "lat": 39.09,
                "scale": 2.5
            },
            {
                "lon": 127.04,
                "lat": 33.27,
                "scale": 2.7
            },
            {
                "lon": 128.75,
                "lat": 34.7,
                "scale": 2.1
            },
            {
                "lon": 127.02,
                "lat": 33.3,
                "scale": 2.1
            },
            {
                "lon": 126.85,
                "lat": 34.09,
                "scale": 2.1
            },
            {
                "lon": 129.82,
                "lat": 35.67,
                "scale": 3.2
            },
            {
                "lon": 129.75,
                "lat": 35.69,
                "scale": 2.4
            },
            {
                "lon": 126.25,
                "lat": 38.42,
                "scale": 2.4
            },
            {
                "lon": 129.92,
                "lat": 36.95,
                "scale": 2
            },
            {
                "lon": 125.92,
                "lat": 33.52,
                "scale": 2.9
            },
            {
                "lon": 127.19,
                "lat": 33.23,
                "scale": 2.2
            },
            {
                "lon": 125.85,
                "lat": 38.73,
                "scale": 2.5
            },
            {
                "lon": 129.82,
                "lat": 35.61,
                "scale": 3.3
            },
            {
                "lon": 125.87,
                "lat": 38.71,
                "scale": 3.1
            },
            {
                "lon": 129.82,
                "lat": 37.6,
                "scale": 2.5
            },
            {
                "lon": 130.04,
                "lat": 35.33,
                "scale": 2.3
            },
            {
                "lon": 126.06,
                "lat": 39.38,
                "scale": 3.1
            },
            {
                "lon": 125.92,
                "lat": 33.52,
                "scale": 2.7
            },
            {
                "lon": 125.89,
                "lat": 33.53,
                "scale": 2.7
            },
            {
                "lon": 125.91,
                "lat": 33.51,
                "scale": 2.3
            },
            {
                "lon": 125.4,
                "lat": 37.75,
                "scale": 2.6
            },
            {
                "lon": 127.15,
                "lat": 40.68,
                "scale": 3.5
            },
            {
                "lon": 125.56,
                "lat": 33.61,
                "scale": 2.3
            },
            {
                "lon": 129.58,
                "lat": 36,
                "scale": 2.2
            },
            {
                "lon": 126.17,
                "lat": 33.05,
                "scale": 2.3
            },
            {
                "lon": 124.68,
                "lat": 34.3,
                "scale": 2.7
            },
            {
                "lon": 129.69,
                "lat": 35.87,
                "scale": 2.6
            },
            {
                "lon": 126.19,
                "lat": 39.49,
                "scale": 3.1
            },
            {
                "lon": 125.86,
                "lat": 38.74,
                "scale": 2.6
            },
            {
                "lon": 129.99,
                "lat": 35.51,
                "scale": 5
            },
            {
                "lon": 129.87,
                "lat": 35.51,
                "scale": 2.6
            },
            {
                "lon": 129.97,
                "lat": 35.48,
                "scale": 2.3
            },
            {
                "lon": 125.83,
                "lat": 38.69,
                "scale": 2.6
            },
            {
                "lon": 130.24,
                "lat": 35.12,
                "scale": 2.8
            },
            {
                "lon": 126.33,
                "lat": 33.06,
                "scale": 2.3
            },
            {
                "lon": 128.09,
                "lat": 38.35,
                "scale": 2.9
            },
            {
                "lon": 125.46,
                "lat": 37.18,
                "scale": 2.1
            },
            {
                "lon": 125.7,
                "lat": 38.84,
                "scale": 2.6
            },
            {
                "lon": 128.09,
                "lat": 38.38,
                "scale": 3
            },
            {
                "lon": 127.31,
                "lat": 33.48,
                "scale": 2.9
            },
            {
                "lon": 127.16,
                "lat": 38.65,
                "scale": 2.4
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.4
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 3
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 3.1
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.5
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.21,
                "lat": 35.78,
                "scale": 3.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.75,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.5
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.19,
                "lat": 35.78,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 2.1
            },
            {
                "lon": 129.19,
                "lat": 35.78,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.78,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.4
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 3.2
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.19,
                "lat": 35.78,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.78,
                "scale": 2.2
            },
            {
                "lon": 129.16,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.3
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.4
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 3
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.2,
                "lat": 35.76,
                "scale": 2.5
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2.5
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.36,
                "lat": 35.73,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 3
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.19,
                "lat": 35.78,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.3
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.7
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.6
            },
            {
                "lon": 129.19,
                "lat": 35.78,
                "scale": 2.2
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.17,
                "lat": 35.74,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.74,
                "scale": 4.5
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 2.1
            },
            {
                "lon": 129.2,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.9
            },
            {
                "lon": 129.15,
                "lat": 35.78,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 3.5
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.19,
                "lat": 35.79,
                "scale": 2.5
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 3.1
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.7
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.16,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 129.16,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.19,
                "lat": 35.75,
                "scale": 3
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.6
            },
            {
                "lon": 129.23,
                "lat": 35.77,
                "scale": 2.2
            },
            {
                "lon": 126.93,
                "lat": 35.08,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 3.3
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.9
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.74,
                "scale": 2.5
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 126.87,
                "lat": 36.46,
                "scale": 2.2
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 2.6
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 2.7
            },
            {
                "lon": 127.02,
                "lat": 37.25,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.37,
                "lat": 35.7,
                "scale": 2.4
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2.1
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 128.49,
                "lat": 35.32,
                "scale": 2.6
            },
            {
                "lon": 126.63,
                "lat": 36.36,
                "scale": 3.5
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 128.09,
                "lat": 35.51,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 2.3
            },
            {
                "lon": 127.33,
                "lat": 36.34,
                "scale": 2.5
            },
            {
                "lon": 127.39,
                "lat": 36.02,
                "scale": 2.2
            },
            {
                "lon": 129.19,
                "lat": 35.77,
                "scale": 2.4
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.36,
                "lat": 35.69,
                "scale": 2.4
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 3.3
            },
            {
                "lon": 128.08,
                "lat": 36.54,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 3.3
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.36,
                "lat": 36.12,
                "scale": 2.2
            },
            {
                "lon": 129.31,
                "lat": 35.78,
                "scale": 2.5
            },
            {
                "lon": 129.36,
                "lat": 36.12,
                "scale": 2.3
            },
            {
                "lon": 129.24,
                "lat": 36.58,
                "scale": 2.5
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 3.3
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2.2
            },
            {
                "lon": 128.42,
                "lat": 36.44,
                "scale": 2.1
            },
            {
                "lon": 127.79,
                "lat": 35.17,
                "scale": 2.2
            },
            {
                "lon": 126.59,
                "lat": 36.33,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2.6
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.6
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 2.9
            },
            {
                "lon": 128.09,
                "lat": 35.64,
                "scale": 2.3
            },
            {
                "lon": 126.94,
                "lat": 35.23,
                "scale": 2.4
            },
            {
                "lon": 129.2,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 129.18,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 127.79,
                "lat": 36.38,
                "scale": 2.3
            },
            {
                "lon": 129.17,
                "lat": 35.74,
                "scale": 2.2
            },
            {
                "lon": 129.18,
                "lat": 35.74,
                "scale": 2.4
            },
            {
                "lon": 127.95,
                "lat": 35.99,
                "scale": 2.3
            },
            {
                "lon": 129.17,
                "lat": 35.75,
                "scale": 2.4
            },
            {
                "lon": 128.23,
                "lat": 36.3,
                "scale": 2.2
            },
            {
                "lon": 127.78,
                "lat": 34.64,
                "scale": 2.1
            },
            {
                "lon": 126.95,
                "lat": 35.21,
                "scale": 2
            },
            {
                "lon": 129.2,
                "lat": 35.79,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 3.3
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 2.5
            },
            {
                "lon": 129.2,
                "lat": 35.78,
                "scale": 2.2
            },
            {
                "lon": 127.8,
                "lat": 35.97,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.7
            },
            {
                "lon": 129.2,
                "lat": 35.76,
                "scale": 2.1
            },
            {
                "lon": 128.77,
                "lat": 35.16,
                "scale": 2.3
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2.2
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 3.1
            },
            {
                "lon": 129.37,
                "lat": 36.11,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 128.88,
                "lat": 35.5,
                "scale": 2.1
            },
            {
                "lon": 128.81,
                "lat": 36.6,
                "scale": 2.1
            },
            {
                "lon": 128.1,
                "lat": 36.74,
                "scale": 2.4
            },
            {
                "lon": 128.1,
                "lat": 36.73,
                "scale": 2
            },
            {
                "lon": 127.43,
                "lat": 35.32,
                "scale": 3
            },
            {
                "lon": 128.92,
                "lat": 36.6,
                "scale": 2.2
            },
            {
                "lon": 128.27,
                "lat": 35.92,
                "scale": 2
            },
            {
                "lon": 128.1,
                "lat": 36.83,
                "scale": 2.1
            },
            {
                "lon": 129.21,
                "lat": 37.28,
                "scale": 2
            },
            {
                "lon": 129.17,
                "lat": 35.77,
                "scale": 2.5
            },
            {
                "lon": 129.18,
                "lat": 35.74,
                "scale": 2.1
            },
            {
                "lon": 129.08,
                "lat": 35.85,
                "scale": 2
            },
            {
                "lon": 129.2,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 127.97,
                "lat": 35.99,
                "scale": 2.5
            },
            {
                "lon": 127.94,
                "lat": 36,
                "scale": 2.4
            },
            {
                "lon": 127.21,
                "lat": 36.42,
                "scale": 2.1
            },
            {
                "lon": 127.13,
                "lat": 36.16,
                "scale": 2.1
            },
            {
                "lon": 127.25,
                "lat": 34.84,
                "scale": 2.8
            },
            {
                "lon": 129.19,
                "lat": 35.79,
                "scale": 2.5
            },
            {
                "lon": 127.54,
                "lat": 35.9,
                "scale": 2
            },
            {
                "lon": 128.57,
                "lat": 35.16,
                "scale": 2
            },
            {
                "lon": 129.18,
                "lat": 35.75,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 2.2
            },
            {
                "lon": 129.31,
                "lat": 36.08,
                "scale": 2.6
            },
            {
                "lon": 129.37,
                "lat": 36.11,
                "scale": 5.4
            },
            {
                "lon": 129.36,
                "lat": 36.1,
                "scale": 3.6
            },
            {
                "lon": 129.39,
                "lat": 36.12,
                "scale": 2.5
            },
            {
                "lon": 129.36,
                "lat": 36.1,
                "scale": 2.4
            },
            {
                "lon": 129.35,
                "lat": 36.11,
                "scale": 2.4
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.8
            },
            {
                "lon": 129.37,
                "lat": 36.12,
                "scale": 2.9
            },
            {
                "lon": 129.35,
                "lat": 36.11,
                "scale": 2.9
            },
            {
                "lon": 129.34,
                "lat": 36.09,
                "scale": 3.5
            },
            {
                "lon": 129.35,
                "lat": 36.11,
                "scale": 2.5
            },
            {
                "lon": 129.38,
                "lat": 36.14,
                "scale": 2.4
            },
            {
                "lon": 129.35,
                "lat": 36.09,
                "scale": 2.6
            },
            {
                "lon": 129.33,
                "lat": 36.09,
                "scale": 2.3
            },
            {
                "lon": 129.37,
                "lat": 36.12,
                "scale": 2.2
            },
            {
                "lon": 129.36,
                "lat": 36.13,
                "scale": 2.9
            },
            {
                "lon": 129.35,
                "lat": 36.09,
                "scale": 2.4
            },
            {
                "lon": 129.36,
                "lat": 36.14,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.12,
                "scale": 4.3
            },
            {
                "lon": 129.37,
                "lat": 36.14,
                "scale": 2.2
            },
            {
                "lon": 129.31,
                "lat": 36.08,
                "scale": 2.8
            },
            {
                "lon": 129.37,
                "lat": 36.14,
                "scale": 2.2
            },
            {
                "lon": 129.32,
                "lat": 36.09,
                "scale": 2.1
            },
            {
                "lon": 129.38,
                "lat": 36.14,
                "scale": 2.1
            },
            {
                "lon": 129.38,
                "lat": 36.14,
                "scale": 2
            },
            {
                "lon": 129.35,
                "lat": 36.11,
                "scale": 2.3
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.2
            },
            {
                "lon": 129.35,
                "lat": 36.11,
                "scale": 2.1
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.4
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.14,
                "scale": 2.1
            },
            {
                "lon": 129.38,
                "lat": 36.14,
                "scale": 2.1
            },
            {
                "lon": 129.36,
                "lat": 36.1,
                "scale": 2.1
            },
            {
                "lon": 129.36,
                "lat": 36.1,
                "scale": 2
            },
            {
                "lon": 129.38,
                "lat": 36.13,
                "scale": 2.1
            },
            {
                "lon": 129.35,
                "lat": 36.14,
                "scale": 2.4
            },
            {
                "lon": 129.35,
                "lat": 36.09,
                "scale": 2
            },
            {
                "lon": 129.35,
                "lat": 36.09,
                "scale": 2.1
            },
            {
                "lon": 129.36,
                "lat": 36.14,
                "scale": 2.5
            },
            {
                "lon": 129.37,
                "lat": 36.14,
                "scale": 2.3
            },
            {
                "lon": 129.34,
                "lat": 36.08,
                "scale": 2
            },
            {
                "lon": 129.34,
                "lat": 36.09,
                "scale": 2.5
            },
            {
                "lon": 129.37,
                "lat": 36.12,
                "scale": 3.6
            },
            {
                "lon": 129.37,
                "lat": 36.12,
                "scale": 2.1
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.3
            },
            {
                "lon": 129.37,
                "lat": 36.13,
                "scale": 2.3
            },
            {
                "lon": 129.34,
                "lat": 36.1,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.12,
                "scale": 2.4
            },
            {
                "lon": 129.37,
                "lat": 36.11,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.12,
                "scale": 2.2
            },
            {
                "lon": 129.36,
                "lat": 36.12,
                "scale": 2.4
            },
            {
                "lon": 129.33,
                "lat": 36.08,
                "scale": 2.1
            },
            {
                "lon": 129.37,
                "lat": 36.12,
                "scale": 2.1
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.6
            },
            {
                "lon": 129.34,
                "lat": 36.11,
                "scale": 2
            },
            {
                "lon": 129.35,
                "lat": 36.09,
                "scale": 2.4
            },
            {
                "lon": 129.38,
                "lat": 36.12,
                "scale": 2.1
            },
            {
                "lon": 129.34,
                "lat": 36.09,
                "scale": 2.2
            },
            {
                "lon": 129.36,
                "lat": 36.12,
                "scale": 3.5
            },
            {
                "lon": 129.36,
                "lat": 36.14,
                "scale": 3.6
            },
            {
                "lon": 129.35,
                "lat": 36.09,
                "scale": 2
            },
            {
                "lon": 129.34,
                "lat": 36.09,
                "scale": 2.1
            },
            {
                "lon": 129.33,
                "lat": 36.11,
                "scale": 2.4
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.5
            },
            {
                "lon": 129.35,
                "lat": 36.12,
                "scale": 2
            },
            {
                "lon": 129.37,
                "lat": 36.11,
                "scale": 2.3
            },
            {
                "lon": 129.35,
                "lat": 36.11,
                "scale": 2.3
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2
            },
            {
                "lon": 129.35,
                "lat": 36.11,
                "scale": 2.3
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.4
            },
            {
                "lon": 128.82,
                "lat": 36.75,
                "scale": 2.1
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.2
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.3
            },
            {
                "lon": 129.42,
                "lat": 35.77,
                "scale": 2.1
            },
            {
                "lon": 128.01,
                "lat": 36.72,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 3.5
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 2.1
            },
            {
                "lon": 129.37,
                "lat": 36.14,
                "scale": 2.2
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 2.8
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 2.3
            },
            {
                "lon": 129.34,
                "lat": 36.11,
                "scale": 2.1
            },
            {
                "lon": 129.17,
                "lat": 35.76,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 2
            },
            {
                "lon": 127.34,
                "lat": 36.26,
                "scale": 2
            },
            {
                "lon": 127.32,
                "lat": 34.32,
                "scale": 2.4
            },
            {
                "lon": 129.37,
                "lat": 36.12,
                "scale": 2.9
            },
            {
                "lon": 129.36,
                "lat": 36.14,
                "scale": 2
            },
            {
                "lon": 129.36,
                "lat": 36.11,
                "scale": 2.1
            },
            {
                "lon": 127.62,
                "lat": 36.37,
                "scale": 2.8
            },
            {
                "lon": 129.31,
                "lat": 36.06,
                "scale": 2.3
            },
            {
                "lon": 129.33,
                "lat": 36.08,
                "scale": 2.5
            },
            {
                "lon": 129.33,
                "lat": 36.08,
                "scale": 4.6
            },
            {
                "lon": 129.33,
                "lat": 36.08,
                "scale": 2.5
            },
            {
                "lon": 129.34,
                "lat": 36.07,
                "scale": 2.2
            },
            {
                "lon": 129.33,
                "lat": 36.08,
                "scale": 2.2
            },
            {
                "lon": 129.32,
                "lat": 36.07,
                "scale": 2.1
            },
            {
                "lon": 129.32,
                "lat": 36.09,
                "scale": 2.1
            },
            {
                "lon": 129.34,
                "lat": 36.08,
                "scale": 2.1
            },
            {
                "lon": 129.32,
                "lat": 36.08,
                "scale": 2.1
            },
            {
                "lon": 129.33,
                "lat": 36.08,
                "scale": 2.4
            },
            {
                "lon": 129.33,
                "lat": 36.07,
                "scale": 2.6
            },
            {
                "lon": 129.37,
                "lat": 36.12,
                "scale": 2.5
            },
            {
                "lon": 129.37,
                "lat": 36.11,
                "scale": 2
            },
            {
                "lon": 129.33,
                "lat": 36.09,
                "scale": 2.6
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.2
            },
            {
                "lon": 129.33,
                "lat": 36.07,
                "scale": 2.4
            },
            {
                "lon": 127.33,
                "lat": 35.3,
                "scale": 2
            },
            {
                "lon": 127.32,
                "lat": 35.31,
                "scale": 2
            },
            {
                "lon": 126.45,
                "lat": 36.95,
                "scale": 2.2
            },
            {
                "lon": 129.37,
                "lat": 36.14,
                "scale": 2.8
            },
            {
                "lon": 128.42,
                "lat": 36.98,
                "scale": 2
            },
            {
                "lon": 129.35,
                "lat": 36.1,
                "scale": 2.7
            },
            {
                "lon": 129.36,
                "lat": 36.1,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.4
            },
            {
                "lon": 129.2,
                "lat": 35.77,
                "scale": 2
            },
            {
                "lon": 127.64,
                "lat": 36.56,
                "scale": 2.5
            },
            {
                "lon": 127.7,
                "lat": 36.1,
                "scale": 2
            },
            {
                "lon": 128.37,
                "lat": 36.72,
                "scale": 2
            },
            {
                "lon": 129.38,
                "lat": 36.22,
                "scale": 2.6
            },
            {
                "lon": 128.49,
                "lat": 36.39,
                "scale": 2.1
            },
            {
                "lon": 129.08,
                "lat": 37.19,
                "scale": 2.3
            },
            {
                "lon": 127.34,
                "lat": 38.18,
                "scale": 2.7
            },
            {
                "lon": 127.7,
                "lat": 37.3,
                "scale": 2.1
            },
            {
                "lon": 127.81,
                "lat": 35.91,
                "scale": 2.7
            },
            {
                "lon": 129.32,
                "lat": 37,
                "scale": 2.5
            },
            {
                "lon": 128.36,
                "lat": 36.78,
                "scale": 2.2
            },
            {
                "lon": 127.3,
                "lat": 36.16,
                "scale": 2
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.3
            },
            {
                "lon": 128.25,
                "lat": 36.08,
                "scale": 2.5
            },
            {
                "lon": 127.3,
                "lat": 36.42,
                "scale": 2.1
            },
            {
                "lon": 128.25,
                "lat": 36.31,
                "scale": 2.4
            },
            {
                "lon": 126.78,
                "lat": 35.72,
                "scale": 2.1
            },
            {
                "lon": 127.95,
                "lat": 35.76,
                "scale": 2.7
            },
            {
                "lon": 128.89,
                "lat": 36.99,
                "scale": 2
            },
            {
                "lon": 128.31,
                "lat": 36.77,
                "scale": 2.2
            },
            {
                "lon": 129.2,
                "lat": 35.79,
                "scale": 2.5
            },
            {
                "lon": 127.93,
                "lat": 37.02,
                "scale": 2
            },
            {
                "lon": 126.62,
                "lat": 33.93,
                "scale": 2.4
            },
            {
                "lon": 128.09,
                "lat": 38.36,
                "scale": 2.5
            },
            {
                "lon": 125.69,
                "lat": 38.74,
                "scale": 2.8
            },
            {
                "lon": 125.73,
                "lat": 38.74,
                "scale": 2.6
            },
            {
                "lon": 125.62,
                "lat": 38.76,
                "scale": 2.3
            },
            {
                "lon": 126.88,
                "lat": 33.53,
                "scale": 2.3
            },
            {
                "lon": 125.07,
                "lat": 33.76,
                "scale": 3.5
            },
            {
                "lon": 129.6,
                "lat": 36.55,
                "scale": 2.3
            },
            {
                "lon": 129.89,
                "lat": 36.46,
                "scale": 2.5
            },
            {
                "lon": 125.66,
                "lat": 38.76,
                "scale": 2.3
            },
            {
                "lon": 128.09,
                "lat": 38.35,
                "scale": 2.5
            },
            {
                "lon": 125.08,
                "lat": 34.86,
                "scale": 2.1
            },
            {
                "lon": 126.14,
                "lat": 38.49,
                "scale": 2.2
            },
            {
                "lon": 125.72,
                "lat": 33.4,
                "scale": 2.9
            },
            {
                "lon": 129.72,
                "lat": 35.81,
                "scale": 2.1
            },
            {
                "lon": 125.48,
                "lat": 37.18,
                "scale": 2.4
            },
            {
                "lon": 129.68,
                "lat": 37.63,
                "scale": 2
            },
            {
                "lon": 125.57,
                "lat": 36.07,
                "scale": 2.6
            },
            {
                "lon": 128.54,
                "lat": 34.45,
                "scale": 2.2
            },
            {
                "lon": 129.39,
                "lat": 35.25,
                "scale": 2.4
            },
            {
                "lon": 125.76,
                "lat": 38.71,
                "scale": 2.6
            },
            {
                "lon": 125.76,
                "lat": 38.64,
                "scale": 2.5
            },
            {
                "lon": 126.27,
                "lat": 39.31,
                "scale": 2.6
            },
            {
                "lon": 125.73,
                "lat": 38.69,
                "scale": 2.4
            },
            {
                "lon": 127.51,
                "lat": 33.64,
                "scale": 2.7
            },
            {
                "lon": 125.86,
                "lat": 38.71,
                "scale": 2.8
            },
            {
                "lon": 125.06,
                "lat": 35.02,
                "scale": 2.5
            },
            {
                "lon": 126.87,
                "lat": 33.54,
                "scale": 2
            },
            {
                "lon": 127.16,
                "lat": 38.7,
                "scale": 2.6
            },
            {
                "lon": 126.73,
                "lat": 33.61,
                "scale": 2.5
            },
            {
                "lon": 127.64,
                "lat": 39.61,
                "scale": 2.6
            },
            {
                "lon": 129.57,
                "lat": 35.65,
                "scale": 2.2
            },
            {
                "lon": 125.84,
                "lat": 38.54,
                "scale": 2.6
            },
            {
                "lon": 129.58,
                "lat": 35.69,
                "scale": 2.3
            },
            {
                "lon": 126.18,
                "lat": 33.23,
                "scale": 2
            },
            {
                "lon": 124.89,
                "lat": 37.4,
                "scale": 3.1
            },
            {
                "lon": 126.09,
                "lat": 38.89,
                "scale": 2.5
            },
            {
                "lon": 129.66,
                "lat": 37.75,
                "scale": 3.2
            },
            {
                "lon": 129.69,
                "lat": 37.74,
                "scale": 2.4
            },
            {
                "lon": 129.59,
                "lat": 37.72,
                "scale": 2.1
            },
            {
                "lon": 129.7,
                "lat": 37.77,
                "scale": 2.1
            },
            {
                "lon": 126.1,
                "lat": 35.75,
                "scale": 2
            },
            {
                "lon": 129.71,
                "lat": 37.75,
                "scale": 2.6
            },
            {
                "lon": 129.78,
                "lat": 35.82,
                "scale": 2
            },
            {
                "lon": 127.18,
                "lat": 33.32,
                "scale": 2.9
            },
            {
                "lon": 126.03,
                "lat": 38.52,
                "scale": 2.4
            },
            {
                "lon": 125.48,
                "lat": 37.17,
                "scale": 2.2
            },
            {
                "lon": 129.85,
                "lat": 35.67,
                "scale": 2.2
            },
            {
                "lon": 125.61,
                "lat": 38.72,
                "scale": 2.1
            },
            {
                "lon": 126.2,
                "lat": 38.99,
                "scale": 2.4
            },
            {
                "lon": 125.18,
                "lat": 36.7,
                "scale": 2.2
            },
            {
                "lon": 127.28,
                "lat": 33.77,
                "scale": 3.2
            },
            {
                "lon": 127.85,
                "lat": 33.33,
                "scale": 2.4
            },
            {
                "lon": 129.44,
                "lat": 36.61,
                "scale": 2.6
            },
            {
                "lon": 126.19,
                "lat": 35.88,
                "scale": 2.5
            },
            {
                "lon": 129.45,
                "lat": 36.61,
                "scale": 2.1
            },
            {
                "lon": 129.44,
                "lat": 36.61,
                "scale": 2.8
            },
            {
                "lon": 124.55,
                "lat": 36.85,
                "scale": 2.1
            },
            {
                "lon": 129.62,
                "lat": 37.73,
                "scale": 2.9
            },
            {
                "lon": 124.4,
                "lat": 36.96,
                "scale": 3
            },
            {
                "lon": 129.56,
                "lat": 35.67,
                "scale": 2.7
            },
            {
                "lon": 126.14,
                "lat": 38.34,
                "scale": 2.2
            },
            {
                "lon": 125.07,
                "lat": 36.54,
                "scale": 2.4
            },
            {
                "lon": 127.21,
                "lat": 33.38,
                "scale": 2.3
            },
            {
                "lon": 125.81,
                "lat": 40,
                "scale": 2.7
            },
            {
                "lon": 127.29,
                "lat": 40.4,
                "scale": 2.8
            },
            {
                "lon": 125.73,
                "lat": 33.51,
                "scale": 2.1
            },
            {
                "lon": 126.19,
                "lat": 37.69,
                "scale": 2.7
            },
            {
                "lon": 126.12,
                "lat": 33.77,
                "scale": 2.2
            },
            {
                "lon": 129.54,
                "lat": 37.39,
                "scale": 2
            },
            {
                "lon": 125.63,
                "lat": 38.7,
                "scale": 2.6
            },
            {
                "lon": 125.52,
                "lat": 33.87,
                "scale": 2.7
            },
            {
                "lon": 125.67,
                "lat": 38.73,
                "scale": 2.6
            },
            {
                "lon": 125.69,
                "lat": 38.73,
                "scale": 2.5
            },
            {
                "lon": 126.13,
                "lat": 38.82,
                "scale": 2.1
            },
            {
                "lon": 125.36,
                "lat": 35.31,
                "scale": 2.4
            },
            {
                "lon": 125.34,
                "lat": 37.6,
                "scale": 2.9
            },
            {
                "lon": 124.16,
                "lat": 35.29,
                "scale": 3.2
            },
            {
                "lon": 127.13,
                "lat": 34.25,
                "scale": 2.2
            },
            {
                "lon": 129.06,
                "lat": 41.35,
                "scale": 2.6
            },
            {
                "lon": 129.06,
                "lat": 41.35,
                "scale": 3.2
            },
            {
                "lon": 127.15,
                "lat": 33.42,
                "scale": 2.5
            },
            {
                "lon": 129.88,
                "lat": 35.56,
                "scale": 2.4
            },
            {
                "lon": 129.03,
                "lat": 41.39,
                "scale": 2.7
            },
            {
                "lon": 125.3,
                "lat": 33.86,
                "scale": 2.8
            },
            {
                "lon": 129.45,
                "lat": 36.59,
                "scale": 2.6
            },
            {
                "lon": 126.16,
                "lat": 38.44,
                "scale": 2.2
            },
            {
                "lon": 126.05,
                "lat": 33.63,
                "scale": 2.7
            },
            {
                "lon": 127.34,
                "lat": 34.39,
                "scale": 2.2
            },
            {
                "lon": 126.48,
                "lat": 36.42,
                "scale": 2.1
            },
            {
                "lon": 126.2,
                "lat": 33.05,
                "scale": 2.5
            },
            {
                "lon": 127.46,
                "lat": 34.84,
                "scale": 2.2
            },
            {
                "lon": 124.82,
                "lat": 37.29,
                "scale": 2.7
            },
            {
                "lon": 125.04,
                "lat": 37.23,
                "scale": 2.6
            },
            {
                "lon": 125.57,
                "lat": 34.05,
                "scale": 2.3
            },
            {
                "lon": 124.65,
                "lat": 36.69,
                "scale": 2.9
            },
            {
                "lon": 127.32,
                "lat": 33.24,
                "scale": 2.7
            },
            {
                "lon": 129.2,
                "lat": 41.32,
                "scale": 2.5
            },
            {
                "lon": 127.15,
                "lat": 33.42,
                "scale": 2.5
            },
            {
                "lon": 129.45,
                "lat": 36.02,
                "scale": 2.1
            },
            {
                "lon": 129.13,
                "lat": 41.32,
                "scale": 2.7
            },
            {
                "lon": 129.1,
                "lat": 41.32,
                "scale": 3
            },
            {
                "lon": 129.11,
                "lat": 41.31,
                "scale": 2.8
            },
            {
                "lon": 129.99,
                "lat": 35.61,
                "scale": 2.3
            },
            {
                "lon": 126.18,
                "lat": 38.32,
                "scale": 2.5
            },
            {
                "lon": 125.64,
                "lat": 36.09,
                "scale": 2.3
            },
            {
                "lon": 127.15,
                "lat": 39.31,
                "scale": 2.2
            },
            {
                "lon": 126.16,
                "lat": 38.33,
                "scale": 2.1
            },
            {
                "lon": 125.94,
                "lat": 37.71,
                "scale": 2.2
            },
            {
                "lon": 127.11,
                "lat": 33.98,
                "scale": 2.1
            },
            {
                "lon": 127.3,
                "lat": 40.24,
                "scale": 3.2
            },
            {
                "lon": 127.4,
                "lat": 33.77,
                "scale": 2.6
            },
            {
                "lon": 129.1,
                "lat": 41.33,
                "scale": 2.6
            },
            {
                "lon": 129.09,
                "lat": 41.32,
                "scale": 2.7
            },
            {
                "lon": 124.99,
                "lat": 35.1,
                "scale": 2.7
            },
            {
                "lon": 125.22,
                "lat": 33.92,
                "scale": 2.5
            },
            {
                "lon": 125.76,
                "lat": 36.6,
                "scale": 2.4
            },
            {
                "lon": 125.38,
                "lat": 37.8,
                "scale": 2.3
            },
            {
                "lon": 126.87,
                "lat": 33.97,
                "scale": 2.4
            },
            {
                "lon": 125.32,
                "lat": 34.52,
                "scale": 2.5
            },
            {
                "lon": 124.87,
                "lat": 37.09,
                "scale": 2.4
            },
            {
                "lon": 130.33,
                "lat": 38.13,
                "scale": 2.6
            },
            {
                "lon": 124.83,
                "lat": 37.78,
                "scale": 2.7
            },
            {
                "lon": 129.82,
                "lat": 36.08,
                "scale": 2.6
            },
            {
                "lon": 129.12,
                "lat": 41.35,
                "scale": 2.3
            },
            {
                "lon": 126.4,
                "lat": 33.21,
                "scale": 2.4
            },
            {
                "lon": 125.92,
                "lat": 37.06,
                "scale": 2.5
            },
            {
                "lon": 125.58,
                "lat": 33.62,
                "scale": 2.5
            },
            {
                "lon": 125.61,
                "lat": 34.16,
                "scale": 2
            },
            {
                "lon": 129.49,
                "lat": 36.37,
                "scale": 2.2
            },
            {
                "lon": 127.68,
                "lat": 38.53,
                "scale": 2.8
            },
            {
                "lon": 129.73,
                "lat": 35.87,
                "scale": 2.3
            },
            {
                "lon": 124.81,
                "lat": 34.9,
                "scale": 2.1
            },
            {
                "lon": 125.25,
                "lat": 36.99,
                "scale": 2.2
            },
            {
                "lon": 129.48,
                "lat": 37.63,
                "scale": 2.2
            },
            {
                "lon": 129.8,
                "lat": 35.83,
                "scale": 2.5
            },
            {
                "lon": 126.16,
                "lat": 36.01,
                "scale": 2.4
            },
            {
                "lon": 129.79,
                "lat": 35.84,
                "scale": 2.3
            },
            {
                "lon": 127.25,
                "lat": 34.47,
                "scale": 2.2
            },
            {
                "lon": 125.91,
                "lat": 33.41,
                "scale": 2.9
            },
            {
                "lon": 125.3,
                "lat": 37.03,
                "scale": 2.1
            },
            {
                "lon": 125.27,
                "lat": 37.03,
                "scale": 2.1
            },
            {
                "lon": 127.53,
                "lat": 33.21,
                "scale": 2.4
            },
            {
                "lon": 130.63,
                "lat": 37.27,
                "scale": 2.5
            },
            {
                "lon": 125.68,
                "lat": 37.92,
                "scale": 2.6
            },
            {
                "lon": 127.42,
                "lat": 34.33,
                "scale": 2.1
            },
            {
                "lon": 129.91,
                "lat": 37.07,
                "scale": 2.4
            },
            {
                "lon": 129.69,
                "lat": 36.05,
                "scale": 2.4
            },
            {
                "lon": 127.7,
                "lat": 40.2,
                "scale": 2.8
            },
            {
                "lon": 125.8,
                "lat": 33.46,
                "scale": 2.5
            },
            {
                "lon": 125.7,
                "lat": 38.74,
                "scale": 2.4
            },
            {
                "lon": 127.18,
                "lat": 38.67,
                "scale": 2.3
            },
            {
                "lon": 124.58,
                "lat": 37.49,
                "scale": 2.4
            },
            {
                "lon": 129.96,
                "lat": 37.26,
                "scale": 2.6
            },
            {
                "lon": 124.94,
                "lat": 35.61,
                "scale": 2.1
            },
            {
                "lon": 125.37,
                "lat": 38.04,
                "scale": 2.2
            },
            {
                "lon": 124.9,
                "lat": 37.8,
                "scale": 3.2
            },
            {
                "lon": 124.87,
                "lat": 37.85,
                "scale": 3.1
            },
            {
                "lon": 127.29,
                "lat": 33.52,
                "scale": 2.3
            },
            {
                "lon": 129.71,
                "lat": 35.91,
                "scale": 2.2
            },
            {
                "lon": 127.16,
                "lat": 38.7,
                "scale": 2.9
            },
            {
                "lon": 125.92,
                "lat": 38.73,
                "scale": 2.2
            },
            {
                "lon": 126.09,
                "lat": 33.15,
                "scale": 2.1
            },
            {
                "lon": 124.53,
                "lat": 34.94,
                "scale": 3.3
            },
            {
                "lon": 129.69,
                "lat": 37.32,
                "scale": 2.1
            },
            {
                "lon": 129.62,
                "lat": 36.45,
                "scale": 2.1
            },
            {
                "lon": 129.62,
                "lat": 36.45,
                "scale": 2.5
            },
            {
                "lon": 129.69,
                "lat": 35.86,
                "scale": 2.2
            },
            {
                "lon": 129.65,
                "lat": 36.53,
                "scale": 2.2
            },
            {
                "lon": 129.69,
                "lat": 35.88,
                "scale": 2
            },
            {
                "lon": 129.66,
                "lat": 36.53,
                "scale": 3.1
            },
            {
                "lon": 129.21,
                "lat": 41.3,
                "scale": 2.8
            },
            {
                "lon": 124.23,
                "lat": 37.37,
                "scale": 3.7
            },
            {
                "lon": 127.62,
                "lat": 33.94,
                "scale": 2.7
            },
            {
                "lon": 126.25,
                "lat": 33.29,
                "scale": 2.6
            },
            {
                "lon": 128.41,
                "lat": 36.72,
                "scale": 2.4
            },
            {
                "lon": 129.03,
                "lat": 36.77,
                "scale": 2.9
            },
            {
                "lon": 128.73,
                "lat": 36.82,
                "scale": 2
            },
            {
                "lon": 126.4,
                "lat": 33.47,
                "scale": 2.4
            },
            {
                "lon": 127.87,
                "lat": 36.34,
                "scale": 2.3
            },
            {
                "lon": 129.19,
                "lat": 35.76,
                "scale": 2.5
            },
            {
                "lon": 128.41,
                "lat": 36.69,
                "scale": 2.4
            },
            {
                "lon": 128.08,
                "lat": 36.33,
                "scale": 2
            },
            {
                "lon": 128.1,
                "lat": 36.5,
                "scale": 3.9
            },
            {
                "lon": 128.3,
                "lat": 35,
                "scale": 2.1
            },
            {
                "lon": 129.66,
                "lat": 36.53,
                "scale": 2.2
            },
            {
                "lon": 129.9,
                "lat": 36.16,
                "scale": 4.1
            },
            {
                "lon": 129.85,
                "lat": 36.16,
                "scale": 2.5
            },
            {
                "lon": 125.86,
                "lat": 38.9,
                "scale": 2.7
            },
            {
                "lon": 125.5,
                "lat": 36.51,
                "scale": 2.9
            },
            {
                "lon": 124.74,
                "lat": 37.31,
                "scale": 2.2
            },
            {
                "lon": 127.12,
                "lat": 39.63,
                "scale": 2.5
            },
            {
                "lon": 126.93,
                "lat": 33.63,
                "scale": 2.4
            },
            {
                "lon": 126,
                "lat": 38.01,
                "scale": 2.2
            },
            {
                "lon": 129.09,
                "lat": 41.32,
                "scale": 2.8
            },
            {
                "lon": 125.2,
                "lat": 37.56,
                "scale": 2.7
            },
            {
                "lon": 126.94,
                "lat": 33.62,
                "scale": 2.2
            },
            {
                "lon": 129.54,
                "lat": 37.88,
                "scale": 4.3
            },
            {
                "lon": 129.8,
                "lat": 36.86,
                "scale": 3.8
            },
            {
                "lon": 126.09,
                "lat": 33.79,
                "scale": 2.5
            },
            {
                "lon": 124.56,
                "lat": 37.42,
                "scale": 2.4
            },
            {
                "lon": 129.54,
                "lat": 36.55,
                "scale": 2.1
            },
            {
                "lon": 129.64,
                "lat": 36.56,
                "scale": 2
            },
            {
                "lon": 127.17,
                "lat": 33.35,
                "scale": 2.4
            },
            {
                "lon": 126.47,
                "lat": 39.15,
                "scale": 3.3
            },
            {
                "lon": 126.3,
                "lat": 38.37,
                "scale": 2.4
            },
            {
                "lon": 126.36,
                "lat": 35.71,
                "scale": 2.2
            },
            {
                "lon": 125.68,
                "lat": 38.81,
                "scale": 2.5
            },
            {
                "lon": 125.71,
                "lat": 38.81,
                "scale": 2.7
            },
            {
                "lon": 125.7,
                "lat": 38.81,
                "scale": 3.4
            },
            {
                "lon": 125.7,
                "lat": 38.81,
                "scale": 3.4
            },
            {
                "lon": 125.73,
                "lat": 38.75,
                "scale": 2.4
            },
            {
                "lon": 125.69,
                "lat": 38.8,
                "scale": 3.9
            },
            {
                "lon": 125.71,
                "lat": 38.8,
                "scale": 2.5
            },
            {
                "lon": 125.71,
                "lat": 38.77,
                "scale": 2.3
            },
            {
                "lon": 129.69,
                "lat": 35.88,
                "scale": 2.7
            },
            {
                "lon": 129.57,
                "lat": 37.91,
                "scale": 2.3
            },
            {
                "lon": 125.73,
                "lat": 38.7,
                "scale": 2.1
            },
            {
                "lon": 125.56,
                "lat": 35.82,
                "scale": 2
            },
            {
                "lon": 129.85,
                "lat": 37.37,
                "scale": 2.7
            }
        ];
    }


    /**
     * viewer 초기화
     * @returns Viewer
     */
    initViewer() {
        let viewer = new Cesium.Viewer('cesium-container', {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            vrButton: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: false,
            shouldAnimate: false,
            skyBox: false,
            skyAtmosphere: false,
            // useDefaultRenderLoop: false,
            showRenderLoopErrors: false,
            useBrowserRecommendedResolution: false,
            automaticallyTrackDataSourceClocks: false,
            // globe: true,
            orderIndependentTranslucency: false,
            shadows: false,
            projectionPicker: false,
            requestRenderMode: false,
        });

        console.log(viewer);
        viewer.canvas.width = 1600;
        viewer.canvas.height = 900;

        return viewer;
    }


    initColors() {
        this.colors = [
            {min: 0.0, max: 1.0, color: '#7A297B'},
            {min: 1.0, max: 2.0, color: '#030A0'},
            {min: 2.0, max: 3.0, color: '#002060'},
            {min: 3.0, max: 4.0, color: '#0000ff'},
            {min: 4.0, max: 5.0, color: '#22B14C'},
            {min: 5.0, max: 6.0, color: '#FFF200'},
            {min: 6.0, max: 7.0, color: '#FF7F27'},
            {min: 7.0, max: 8.0, color: '#ff0000'},
        ];
    }

}