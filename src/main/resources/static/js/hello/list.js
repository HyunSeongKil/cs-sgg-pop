/**
 * 헬로 - 목록
 */
class List {
    constructor() {
    }

    /**
     * 초기
     */
    init() {
        this.setEventHandler();
        this.search();

        let parser = new UAParser();
        console.log(parser.getResult());
    }


    /**
     * 이벤트 등록
     */
    setEventHandler() {
        let self = this;

        //등록 클릭
        VV.Ui.click('button.regist-form', () => {
            self.registForm();
        });

        //검색 클릭
        VV.Ui.click('button.search', () => {
            self.setPageNo();
            self.search();
        });

        //엔터
        VV.Ui.enter('[type=search]', (el) => {
            self.setPageNo();
            self.search();
        });
    }


    /**
     * set 페이지 인덱스
     * @param {string|number} page 페이지 인덱스. 기본:0
     */
    setPageNo(pageNo = 1) {
        VV.Ui.val('input[name=pageNo]', pageNo);
    }


    /**
     * 검색
     */
    search() {
        let self = this;


        let json = {};
        json.searchName = VV.Ui.val('input[name=searchName]');
        json.searchCn = VV.Ui.val('input[name=searchCn]');
        json.page = Web.toPageIndex(VV.Ui.val('[name=pageNo]'));
        json.size = Web.DEFAULT_PAGE_SIZE;

        this.getData(json, (res) => {
            self.showData(res);
        });
    }


    /**
     * 데이터 요청
     * @param {object} json
     * @param {function} callbackFn
     */
    getData(json, callbackFn) {
        VV.Ajax.get(`../rest/hellos`, json, callbackFn, 'json');
    }


    /**
     * 데이터 표시
     * @param {object} res
     */
    showData(res) {
        let self = this;


        //데이터 바인드
        let template = Handlebars.compile(document.querySelector('#item-template').innerHTML);
        let html = template({content: res.data.content});
        document.querySelector('table.table > tbody').innerHTML = html;

        //전체건수
        document.querySelector('span.totcnt').innerHTML = VV.formatNumber(res.data.totalElements);


        //페이징
        Web.paging(res.data.totalElements, res.data.pageable.pageNumber + 1, 'div.pagination', (pageNo, el) => {
            self.setPageNo(pageNo);
            self.search();
        });


        //항목 클릭 이벤트 등록
        document.querySelectorAll('table.table > tbody > tr > td > a').forEach(el => {
            el.addEventListener('click', () => {
                let id = el.parentElement.parentElement.dataset['id'];

                location.href = `./detail?id=${id}`;
            })
        });

    }


    /**
     * 등록폼으로 이동
     */
    registForm() {
        location.href = './regist-form';
    }
}