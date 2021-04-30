/**
 * geojson을 이용한 데모 - 행정구역별 인구수
 * @author gravity@vaiv.kr
 * @since 2021-04-28
 */
class CsSggPop {
    //한반도 중심점
    LO_VALUE = 128.02025;
    LA_VALUE = 38.03375;
    AL_VALUE = 1500000;

    labelEntity = null;

    sds = [
        {code: '11', nm: '서울특별시'},
        {code: '26', nm: '부산광역시'},
        {code: '27', nm: '대구광역시'},
        {code: '28', nm: '인천광역시'},
        {code: '29', nm: '광주광역시'},
        {code: '30', nm: '대전광역시'},
        {code: '31', nm: '울산광역시'},
        {code: '36', nm: '세종특별자치시'},
        {code: '41', nm: '경기도'},
        {code: '42', nm: '강원도'},
        {code: '43', nm: '충청북도'},
        {code: '44', nm: '충청남도'},
        {code: '45', nm: '전라북도'},
        {code: '46', nm: '전라남도'},
        {code: '47', nm: '경상북도'},
        {code: '48', nm: '경상남도'},
        {code: '50', nm: '제주특별자치도'},
    ];


    constructor() {
        this.viewer = null;

    }


    /**
     * 초기
     */
    init() {
        this.showSds();



        //viewer 초기화
        this.viewer = this.initViewer();

        //label entity 생성
        this.initLabelEntity();

        //한반도 전경으로 이동
        this.flyTo(this.LO_VALUE, this.LA_VALUE, this.AL_VALUE);


        this.loadGeoJson();


        this.setEventHandler();
    }


    /**
     * 시도 목록 표시
     */
    showSds() {
        let s = '';
        this.sds.forEach(sd => {
            s += `<label class="w-100">`;
            s += `  <input type="checkbox" class="form-control w-25 d-inline sgg" value="${sd.code}">${sd.nm}`;
            s += `</label>`;
        });

        console.log(s);
        document.querySelector('div.sds').innerHTML = s;
    }


    /**
     *
     */
    initLabelEntity() {
        this.labelEntity = this.viewer.entities.add({
            label: {
                show: false,
                showBackground: true,
                font: '14px monospace',
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(15, 0),
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            }
        });

    }


    /**
     *
     */
    loadGeoJson() {

        // Cesium.GeoJsonDataSource.crsNames['urn:ogc:def:crs:EPSG:3857'] = Cesium.GeoJsonDataSource.crsNames['EPSG:3857'];
        let ds = Cesium.GeoJsonDataSource.load('../data/National_SGG.geojson', {
            fill: Cesium.Color.fromAlpha(Cesium.Color.WHITESMOKE, 0.1),
            // stroke: Cesium.Color.fromAlpha(Cesium.Color.GRAY, 1),
            stroke: Cesium.Color.DARKGRAY,
            strokeWidth: 100,
        });
        this.viewer.dataSources.add(ds);
        this.viewer.zoomTo(ds);

    }

    getAllCheckedValues() {
        let arr = [];

        document.querySelectorAll('input[type=checkbox].sgg').forEach(el => {
            if (el.checked) {
                arr.push(el.value);
            }
        });

        return arr;
    }

    /**
     *
     */
    setEventHandler() {
        let self = this;

        document.querySelector('img.logo').addEventListener('click', ()=>{
           self.flyTo(self.LO_VALUE, self.LA_VALUE, self.AL_VALUE);
        });


        //
        document.querySelector('button.all-sgg-on').addEventListener('click', ()=>{
            document.querySelectorAll('input[type=checkbox].sgg').forEach(el=>{
               el.checked = true;
            });

            self.showSggPop(self.getAllCheckedValues());
        });



        //
        document.querySelector('button.all-sgg-off').addEventListener('click', ()=>{
            document.querySelectorAll('input[type=checkbox].sgg').forEach(el=>{
                el.checked = false;
            });

            self.showSggPop(self.getAllCheckedValues());
        });


        //
        document.querySelectorAll('input[type=checkbox].sgg').forEach(el=>{
           el.addEventListener('click', ()=>{

               self.showSggPop(self.getAllCheckedValues());
           })
        });



        //
        document.querySelector('button.start-picking').addEventListener('click', () => {
            let handler = new Cesium.ScreenSpaceEventHandler(self.viewer.scene.canvas);
            handler.setInputAction((evt) => {
                if (!Cesium.defined(evt) || !Cesium.defined(evt.endPosition)) {
                    return;
                }

                if (Cesium.SceneMode.MORPHING === self.viewer.scene.mode) {
                    return;
                }


                if (!self.viewer.scene.pickPositionSupported) {
                    return;
                }

                let pickedObject = self.viewer.scene.pick(evt.endPosition);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }

                let ctsn = self.viewer.camera.pickEllipsoid(evt.endPosition, self.viewer.scene.globe.ellipsoid);
                if (!Cesium.defined(ctsn)) {
                    self.labelEntity.label.show = false;
                    return;
                }


                let cartographic = Cesium.Cartographic.fromCartesian(ctsn);
                let lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
                let lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
                let heightString = cartographic.height.toFixed(2);
                let nm = self.getValue(pickedObject.id, '_SIG_KOR_NM');
                let co = self.getValue(pickedObject.id, '2021_03');

                self.labelEntity.position = ctsn;
                self.labelEntity.label.show = true;
                self.labelEntity.label.text = `○위치: ${lon}, ${lat}\n○행정구역: ${nm}\n○인구수: ${co}`;

                let z = -10000; //-cartographic.height * (self.viewer.scene.mode === Cesium.SceneMode.SCENE2D ? 1.5 : 1.0);
                self.labelEntity.label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, z);

            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        });


        //
        document.querySelector('button.end-picking').addEventListener('click', () => {

        });
    }



    showSggPop(sggs){
        let self = this;

        let ds = this.viewer.dataSources._dataSources[0];
        let v;
        let i = 0;
        let index;


        ds.entities.values.forEach(ent => {
            if(null == ent.properties['SIG_CD']._value){
                return;
            }


            let b = false;
            sggs.forEach(cd=>{
                if(ent.properties['SIG_CD']._value.startsWith(cd)){
                    b = true;
                }
            });

            if(!b){
                // ent.polygon.show = false;
                ent.polygon.fill = false;
                ent.polygon.material = self.createColorMaterialProperty(-1);
                ent.polygon.extrudedHeight = 0;
                return;
            }

            if(0 < ent.polygon.extrudedHeight){
                return;
            }



            v = ent.properties['2021_03']._value;
            index = self.getIndex(v);

            if (-1 === index) {
                return;
            }

            // ent.polygon.show = true;
            ent.polygon.fill = true;
            ent.polygon.material = self.createColorMaterialProperty(index);
            ent.polygon.extrudedHeight = v / 100;
            ent.polygon.outline = false;


        });
    }


    /**
     *
     * @param {*} entity
     * @param {*} key
     * @returns
     */
    getValue(entity, key) {
        if(!Cesium.defined(entity.properties[key])){
            return '';
        }

        let v = entity.properties[key]._value;
        if ('object' === typeof (v)) {
            return '';
        }

        if (!isNaN(v)) {
            return VV.formatNumber(v);
        }

        return v;
    }


    /**
     * 실제 처리
     * @param {string} propertyKey  property에서 꺼낼 키값
     * @param {array} indexes
     * @returns
     */
    xxx(propertyKey, indexes) {
        if (null == propertyKey || '' == propertyKey) {
            return;
        }


        let self = this;

        let ds = self.viewer.dataSources._dataSources[0];
        let v;
        let i = 0;
        let index;


        ds.entities.values.forEach(ent => {
            v = ent.properties[propertyKey]._value;
            index = self.getIndex(v);

            if (-1 === index) {
                return;
            }

            ent.polygon.fill = true;
            ent.polygon.material = self.createColorMaterialProperty(index);
            ent.polygon.extrudedHeight = v / 100;
            ent.polygon.outline = false;


        });

    }


    getIndex(v) {
        if (isNaN(v) || 'object' === typeof (v)) {
            return -1;
        }

        return 0;
    }


    /**
     *
     * @param {number} index
     * @returns
     */
    createColorMaterialProperty(index) {
        if(-1 === index){
            let color = Cesium.Color.WHITE; //new Cesium.Color.fromCssColorString(this.colors[index]);
            return new Cesium.ColorMaterialProperty(Cesium.Color.fromAlpha(color, 0.1));
        }

        let color = Cesium.Color.fromRandom(); //new Cesium.Color.fromCssColorString(this.colors[index]);
        return new Cesium.ColorMaterialProperty(Cesium.Color.fromAlpha(color, 1.0));
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

        viewer.canvas.width = 1600;
        viewer.canvas.height = 900;

        console.log('<<initViewer', viewer);

        return viewer;
    }

}