/**
 * web application 전체 공통
 */
class Web {

    static DEFAULT_PAGE = 0;
    static DEFAULT_PAGE_SIZE = 2;

    /**
     * 페이징 html 문자열 생성
     * @param {object} pagingJson
     * @returns
     */
    static getPagingHtml(pagingJson) {
        let arr = [];
        pagingJson.pages.forEach(pageNo => {
            arr.push(`<li class='${pagingJson.currentPage == pageNo ? 'on' : ''}'><a href='javascript:;'  data-page-no='${pageNo}'>${pageNo}</a></li>`);
        });

        let s = '';
        s += `<ul class='pagination'>`;
        s += `<li><a href='javascript:;' data-page-no='${pagingJson.startPage}'>[처음]</a></li>`;
        s += arr.join('');
        s += `<li><a href='javascript:;' data-page-no='${pagingJson.endPage}'>[마지막]</a></li>`;
        s += `</ul>`;

        return s;
    }


    /**
     * 페이지 번호를 페이지 인덱스로 변환
     * 페이지 번호 : 1부터 시작
     * 페이지 인덱스 : 0부터 시작
     * @param {string|number} pageNo  페이지 번호
     */
    static toPageIndex(pageNo) {
        if (VV.isEmpty(pageNo)) {
            return 0;
        }

        return parseInt(pageNo) - 1;
    }


    /**
     * 페이징
     *  1. 페이징 계산
     *  2. 페이징 html 화면에 표시
     *  3. 클릭 이벤트 등록
     * @param {string|number} total
     * @param {string|number} pageNo
     * @param {string} selector
     * @param {function} callbackFn
     */
    static paging(total, pageNo = 1, selector, callbackFn) {
        let pagingJson = VV.paginate(total, pageNo, Web.DEFAULT_PAGE_SIZE);

        document.querySelector(selector).innerHTML = Web.getPagingHtml(pagingJson);

        //페이지 클릭 이벤트 등록
        document.querySelectorAll('div.pagination a[data-page-no]').forEach(el => {
            el.addEventListener('click', () => {
                callbackFn(parseInt(el.dataset['pageNo']), el);
            });
        });
    }

}