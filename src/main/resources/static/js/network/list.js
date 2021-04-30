class List {

    constructor() {
        this.nodesEdges = {};
        this.network = null;
        this.networkData = {};
    }

    init() {
        this.setEventHandler();

    }

    setEventHandler() {
        let self = this;


        //검색
        VV.Ui.click('button.search', () => {
            let keyword = VV.Ui.val('[name=searchKeyword]');
            let startDate = VV.Ui.val('[name=searchStartDate]').replace(/-/gi, '');
            let endDate = VV.Ui.val('[name=searchEndDate]').replace(/-/gi, '');

            self.getData(keyword, startDate, endDate, (res) => {
                let uid = VV.createUid();
                let nodesEdges = self.createData(res, uid);
                nodesEdges.nodes.push({id: uid, label: keyword, text: keyword, shape: 'star', color: 'red'});

                self.showData(nodesEdges);
            });

        });

        //추가
        VV.Ui.click('button.add', () => {

        });
    }


    /**
     * test http://tm2api.some.co.kr/TrendMap/JSON/ServiceHandler?lang=ko&source=blog&startDate=20210313&endDate=20210413&keyword=아이폰&topN=100&cutOffFrequencyMin=0&cutOffFrequencyMax=0&outputOption[]=freq&categorySetName=SM&command=GetKeywordAssociation&requestParam: {"lang":"ko","source":"blog","startDate":"20210313","endDate":"20210413","keyword":"아이폰","topN":"100","cutOffFrequencyMin":"0","cutOffFrequencyMax":"0","outputOption":["freq"],"categorySetName":"SM","command":"GetKeywordAssociation"}
     * @param {function} callbackFn
     */
    getData(keyword, startDate, endDate, callbackFn) {
        toastr.info('데이터 조회중입니다.');

        let url = 'http://tm2api.some.co.kr/TrendMap/JSON/ServiceHandler';
        let p = {
            'lang': 'ko',
            'source': 'blog',
            'startDate': startDate,
            'endDate': endDate,
            'keyword': keyword,
            'topN': 20,
            'cutOffFrequencyMin': 0,
            'cutOffFrequencyMax': 0,
            'categorySetName': 'SM',
            'command': 'GetKeywordAssociation',
            'outputOption': '["freq"]',
        };

        VV.Ajax.get(url, p, (res) => {
            callbackFn(JSON.parse(res));
        });
        //
    }

    showData(nodesEdges) {
        let self = this;


        // create a network
        var container = document.querySelector('div.network');
        this.networkData = {
            nodes: new vis.DataSet(nodesEdges.nodes),
            edges: new vis.DataSet(nodesEdges.edges),
        };
        var options = {};
        this.network = new vis.Network(container, this.networkData, options);


        //노드 클릭 이벤트
        this.network.on('doubleClick', function (properties) {
            let ids = properties.nodes;
            let clickedNodes = self.networkData.nodes.get(ids);
            //console.log(ids, clickedNodes);

            let keyword = encodeURIComponent(clickedNodes[0].text);
            let startDate = VV.Ui.val('[name=searchStartDate]').replace(/-/gi, '');
            let endDate = VV.Ui.val('[name=searchEndDate]').replace(/-/gi, '');


            self.getData(keyword, startDate, endDate, (res) => {
                let nodesEdges = self.createData(res, clickedNodes[0].id);
                self.networkData.nodes.add(nodesEdges.nodes);
                self.networkData.edges.add(nodesEdges.edges);


                //self.showData(self.nodesEdges);
            });
        });

    }

    createData(res, uid) {
        let nodes = [];
        let edges = [];

        for (let i = 0; i < res.childList.length; i++) {
            let item = res.childList[i];

            nodes.push({
                'id': `${uid + i}`,
                'label': `${item.label} ${item.score}`,
                'text': `${item.label}`,
                'color': `${this.getColor(item.score)}`
            });
            edges.push({'from': `${uid}`, 'to': `${uid + i}`});
        }

        return {nodes, edges};
    }

    getColor(score) {
        if (50 > score) {
            return '#ffe7d8';
        }

        if (100 > score) {
            return '#ffceb0';
        }

        if (150 > score) {
            return '#ffb689';
        }

        if (200 > score) {
            return '#eb5800';
        }

        return '#9c3b00';
    }


}