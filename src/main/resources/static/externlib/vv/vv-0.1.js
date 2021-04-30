/**
 * SDT 공통 js
 * @since 2021-04
 */
class VV {


    /**
     * @see VV.Ui.getGpuRenderer()
     * @returns {string}
     */
    static getGpuRenderer() {
        return VV.Ui.getGpuRenderer();
    }


    /**
     * @see VV.Ui.getAllClientInfo()
     * @returns {object}
     */
    static getAllClientInfo() {
        return VV.Ui.getAllClientInfo();
    }


    /**
     * -(대시, 하이픈), 언더바(_), 공백( )을 camel case로 변환
     *  예)VV.toCamelCase('abcd-abcd') => abcdAbcd
     * @param {string} str 문자열
     * @returns {string}
     */
    static camelize(str) {
        if (VV.isEmpty(str)) {
            return '';
        }


        return str.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();
        });
    }


    /**
     * camelize의 반대
     * @param {string} str
     * @param {string} separator
     */
    static decamelize(str, separator = '-') {
        return str
            .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
            .toLowerCase();
    }


    /**
     * 콤마 제거
     *  예)VV.unComma('1,234') => '1234'
     * @param {string} str
     */
    static unComma(str) {
        if (VV.isEmpty(str)) {
            return '';
        }

        if (!VV.isString(str)) {
            return '';
        }

        //
        return str.replace(/,/gi, '');
    }


    /**
     * 천단위 콤마
     *  예)VV.formatNumber(1234) => '1,234'
     *  예)VV.formatNumber('1234') => '1,234'
     *  예)VV.formatNumber(null|undefined) => ''
     * @param {string|number} strOrNum
     */
    static formatNumber(strOrNum) {
        let s = '';

        if (VV.isNumber(strOrNum)) {
            s = '' + strOrNum;
        }

        if (VV.isString(strOrNum)) {
            s = strOrNum;
        }

        if (VV.isEmpty(s)) {
            return '';
        }


        //
        return s.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
    }


    /**
     * 날짜 포맷팅
     * @param {string|Date} strOrDate
     * @param {string} pattern
     * @returns {string}
     */
    static formatDate(strOrDate, pattern = 'yyyy-MM-dd') {
        if (VV.isString(strOrDate)) {
            let str = strOrDate;
            str = str.replace(/[-|.| ]/gi, '');

            if (8 < str.length && 'yyyy-MM-dd' === pattern) {
                return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;
            }

            //todo


            return '';
        }


        if (VV.isDate(strOrDate)) {
            let dt = strOrDate;

            let yyyy = dt.getFullYear();
            let mm = dt.getMonth() + 1;
            mm = (10 > mm) ? '0' + mm : mm;
            let dd = dt.getDate();
            dd = (10 > dd) ? '0' + dd : dd;
            let hh = dt.getHours();
            hh = (10 > hh) ? '0' + hh : hh;
            let mi = dt.getMinutes();
            mi = (10 > mi) ? '0' + mi : mi;

            switch (pattern) {
                case 'yyyy-MM-dd':
                    return `${yyyy}-${mm}-${dd}`;
                case 'yyyy-MM-dd HH:mm':
                    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
                default:
                //todo
            }
        }

        return '';
    }


    /**
     * 일자는 구분자로 구분된 문자열로 리턴
     *  예)VV.getYmd() => 2021-04-01
     * @param {Date|null} dt 일자
     * @param {String|null} deli 구분자
     * @returns {string} yyyy-MM-dd
     */
    static getYmd(dt = new Date(), deli = '-') {
        let arr = [];

        arr.push(dt.getFullYear());

        let m = dt.getMonth() + 1;
        arr.push(10 > m ? '0' + m : m);

        let d = dt.getDate();
        arr.push(10 > d ? '0' + d : d);

        return arr.join(deli);
    }


    /**
     * 유니크한 문자열 생성
     * @param {string} pre
     * @returns {string}
     */
    static createUid(pre = '') {
        return pre + new Date().getTime();
    }


    /**
     * uuid v4 문자열 생성
     * @see https://goni9071.tistory.com/209
     * @returns {string}
     */
    static uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 3 | 8);
            return v.toString(16);
        });
    }


    /**
     * 널인지 여부
     *  예)VV.isNotNull(null) => true
     *  예)VV.isNotNull(undefined) => true
     *  예)VV.isNotNull('') => false
     * @param {object} obj
     * @returns {boolean} 널이면 true
     */
    static isNull(obj) {
        return (null === obj || undefined === obj);
    }


    /**
     * 널이 아닌지 여부
     *  예)VV.isNotNull(null) => false
     *  예)VV.isNotNull(undefined) => false
     *  예)VV.isNotNull('') => true
     * @param {object} obj
     * @returns {boolean} 널이 아니면 true
     */
    static isNotNull(obj) {
        return !VV.isNull(obj);
    }


    /**
     * obj가 널|빈문자열|빈배열|빈json인지 여부
     * 그 이외의 경우 모두 false 리턴
     *  예)VV.isEmpty('') => true
     *  예)VV.isEmpty([]) => true
     *  예)VV.isEmpty({}) => true
     * @param {object} obj
     * @requires {boolean} obj가 널|빈문자열|빈배열|빈json 이면 true
     */
    static isEmpty(obj) {
        if (VV.isNull(obj)) {
            return true;
        }

        if (VV.isString(obj)) {
            return ('' === obj ? true : false);
        }

        if (VV.isObject(obj)) {
            return (0 === Object.keys(obj).length ? true : false);
        }

        if (Array.isArray(obj)) {
            return (0 === obj.length ? true : false);
        }


        return false;
    }


    /**
     * VV.isEmpty()의 반대
     *  예)VV.isNotEmpty('v') => true
     *  예)VV.isNotEmpty(['v']) => true
     *  예)VV.isNotEmpty({'k':'v'}) => true
     * @param {object} obj
     * @returns {boolean}
     */
    static isNotEmpty(obj) {
        return !VV.isEmpty(obj);
    }


    /**
     * 한글존재 여부
     * @param {string} str
     * @returns {boolean} 한글이면 true
     */
    static hasKorean(str) {
        let pattern_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        return pattern_kor.test(str);
    }


    /**
     * 문자열인지 여부
     *  예)VV.isString('') => true
     * @param {object} obj
     * @returns {boolean} 문자열이면 true
     */
    static isString(obj) {
        return ('string' === typeof obj);
    }


    /**
     * 숫자인지 여부
     *  예)VV.isNumber(1) => true
     * @param {object} obj
     * @returns {boolean} 숫자면 true
     */
    static isNumber(obj) {
        return ('number' === typeof obj);
    }


    /**
     * object인지 여부
     *  예)VV.isObject({}) => true
     * @param {object} obj
     * @returns {boolean} object이면 true
     */
    static isObject(obj) {
        return ('object' === typeof obj);
    }


    /**
     * 날짜형인지 여부
     *  예)VV.isDate(new Date()) => true
     * @param {object} obj
     * @returns {boolean} 날짜형이면 true
     */
    static isDate(obj) {
        return obj instanceof Date;
    }


    /**
     * 문자열에 공백이 존재하는지 여부
     *  예)VV.hasSpace(' ') => true
     * @param {string} str
     * @returns {boolean} 공백 존재하면 true
     */
    static hasSpace(str) {
        if (!VV.isString(str)) {
            throw new Error('todo');
        }

        return / /.test(str);
    }


    /**
     * 문자열에 숫자가 존재하는지 여부
     *  예)VV.hasNumber('a1bcd') => true
     * @param {string} str
     * @returns {boolean} 숫자가 존재하면 true
     */
    static hasNumber(str) {
        if (!VV.isString(str)) {
            throw new Error('todo');
        }

        return /[0-9]/.test(str);
    }


    /**
     * 오라클의 nvl()
     *  예)VV.nvl(null, 'a') => 'a'
     * @param {object} obj
     * @param {object} defaultValue 기본값 선택 기본:''
     * @returns {object}
     */
    static nvl(obj, defaultValue = '') {
        return VV.isNotEmpty(obj) ? obj : defaultValue;
    }


    /**
     * 랜덤값
     * @param {number} min 최소범위 선택. 기본:0
     * @param {number} max 최대범위 선택. 기본:100
     * @returns {number}
     */
    static random(min = 0, max = 100) {
        for (let i = 0; i < 100; i++) {
            let no = Math.floor((Math.random() * 100) + 1);

            if (min <= no && no < max) {
                return no;
            }
        }

        return max;
    }


    /**
     * async하게 javascript 로드
     * @param {string} src js파일 경로
     * @param {string} charset 문자셋. 선택. 기본:utf-8
     * @history 20210307    init
     */
    static loadScript(src, charset = 'UTF-8') {
        let el = document.createElement('script');
        el.type = 'text/javascript';
        el.src = src;
        el.charset = charset || 'ISO-8859-1';

        let headEl = document.getElementsByTagName('head');
        if (VV.isNotNull(headEl)) {
            headEl.appendChild(el);
            return;
        }


        let bodyEl = document.getElementsByTagName('body');
        if (VV.isNotNull(bodyEl)) {
            bodyEl.appendChild(el);
            return;
        }

        console.debug('<<.loadScript - null head and body element');

    }


    /**
     * 페이징
     * @see https://jasonwatmore.com/post/2018/08/07/javascript-pure-pagination-logic-in-vanilla-js-typescript
     * @param {number} totalItems 전체 아이템 건수
     * @param {number} currentPage 현재 페이지 번호. 옵션. 기본:1
     * @param {number} pageSize 페이징 크기. 옵션. 기본:10
     * @param {number} maxPages 전체 페이지수. 옵션. 기본:10
     * @returns {object}
     */
    static paginate(totalItems, currentPage = 1, pageSize = 10, maxPages = 10) {

        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage, endPage;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems,
            currentPage,
            pageSize,
            totalPages,
            startPage,
            endPage,
            startIndex,
            endIndex,
            pages
        };

    }


}


/**
 * SDT 공통 js - ajax관련
 * @since 2021-04
 */
VV.Ajax = class Ajax {
    /**
     * 요청 공통
     * @param {string} method post|get|put|delete
     * @param {string} url
     * @param {object|FormData} data
     * @param {function} callbackFn
     * @param {string} dataType 서버에서 응답받은 데이터 형식 text|json|xml
     */
    static _request(method, url, data = null, callbackFn = null, dataType = 'text') {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            try {
                if (XMLHttpRequest.DONE !== xhr.readyState) {
                    return;
                }


                if (200 !== xhr.status) {
                    console.error(xhr.status, xhr);
                    return;
                }


                if (null == callbackFn) {
                    return;
                }

                if ('json' === dataType) {
                    callbackFn(JSON.parse(xhr.responseText), data, xhr);
                    return;
                }

                if ('text' === dataType || 'xml' === dataType) {
                    callbackFn(xhr.responseText, data, xhr);
                    return;
                }

            } catch (e) {
                console.error(e);
            }
        }

        let p = (-1 === url.indexOf('?') ? '?' : '&') + '_=' + new Date().getTime();


        if ('post' === method || 'put' === method) {
            xhr.open(method, url + p, true);

            if ('object' == typeof data) {
                xhr.setRequestHeader('Content-type', 'application/json');
                xhr.send(JSON.stringify(data));
                return;
            }


            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(data);
        }

        if ('get' === method || 'delete' === method) {
            if (VV.isNotNull(data)) {
                if (data instanceof FormData) {
                    for (let k of data.keys()) {
                        p += `&${k}=${data.get(k)}`;
                    }
                }

                if (VV.isObject(data)) {
                    Object.keys(data).forEach(k => {
                        p += `&${k}=${data[k]}`;
                    });
                }
            }

            xhr.open(method, url + p);
            xhr.send();
        }

    }


    /**
     * 조회(get) 요청
     * @param {string} url
     * @param {object|FormData} data
     * @param {function} callbackFn
     * @param {string} dataType 서버에서 내려온 데이터 형식. xml|json|text
     */
    static get(url, data = null, callbackFn = null, dataType = 'text') {
        VV.Ajax._request('get', url, data, callbackFn, dataType);
    }


    static getJSON(url, data = null, callbackFn = null) {
        return VV.Ajax._request('get', url, data, callbackFn, 'json');
    }


    /**
     * 등록(post) 요청
     * @param {string} url
     * @param {object|FormData} data
     * @param {function} callbackFn
     */
    static post(url, data, callbackFn = null) {
        VV.Ajax._request('post', url, data, callbackFn);
    }


    /**
     * 삭제(delete) 요청
     * @param {string} url
     * @param {object|FormData} param
     * @param {function} callbackFn
     */
    static delete(url, param = null, callbackFn = null) {
        VV.Ajax._request('delete', url, param, callbackFn);
    }


    /**
     * 수정(put) 요청
     * @param {string} url
     * @param {object|FormData} param
     * @param {function} callbackFn
     */
    static put(url, param, callbackFn = null) {
        VV.Ajax._request('put', url, param, callbackFn);
    }

}


/**
 * SDT 공통? js - ui관련
 * @since 2021-04
 */
VV.Ui = class Ui {
    /**
     * obj를 엘리먼트 목록으로 변환
     * @param {string|string[]|Element|Elment[]} obj
     * @returns {Array<NodeList|HTMLCollection>}
     */
    static toElements(obj) {
        if (VV.isEmpty(obj)) {
            return [];
        }

        if (!Array.isArray(obj)) {
            return VV.Ui.toElements([obj]);
        }

        let arr = [];

        obj.forEach(x => {
            if ('string' === typeof (x)) {
                arr = arr.concat(Array.from(document.querySelectorAll(x)));
                return;
            }

            if (x instanceof NodeList) {
                arr = arr.concat(Array.from(x));
                return;
            }

            if (x instanceof HTMLCollection) {
                arr = arr.concat(Array.from(x));
                return;
            }

            if (x instanceof Element) {
                arr = arr.concat(Array.from([x]));
                return;
            }
        });

        return arr.filter(x => {
            return VV.isNotNull(x);
        })
    }


    /**
     * 체크박스에서 체크된 값 목록 추출
     * @param {string} selector
     * @returns {string[]} 체크된 값 목록
     */
    static getCheckedValues(selector) {
        let arr = [];


        VV.Ui.toElements(selector).forEach(el => {
            if ('INPUT' === el.tagName && el.checked) {
                arr.push(el.value);
            }
        });


        return arr;
    }


    /**
     * className으로 모든 엘리먼트 목록 조회. className이 정확하게 일치해야 함(like조건 아님)
     * @param {string} className 클래스 명
     * @returns className을 가지고 있는 엘리먼트 목록
     * @history 20210307    init
     */
    static getElementsByClassName(className) {
        let arr = [];
        let els = document.getElementsByTagName('*');

        els.forEach(el => {
            if (VV.isNull(el)) {
                return;
            }

            let classes = el.className.split(' ');
            if (VV.isEmpty(classes)) {
                return;
            }

            if (VV.hasClass(el, className)) {
                arr.push(el);
            }
        });

        return arr;

    }


    /**
     * 엔터키 이벤트 등록
     * 예) VV.Ui.enter('input[type=search]', function(el){ console.log(el); })
     * 예) VV.Ui.enter(['input[type=text]', 'input#id', 'input#pw'], function(el){ console.log(el); })
     * @param {string|string[]} selector
     * @param {*} callbackFn
     */
    static enter(selector, callbackFn) {
        //문자열
        if ('string' === typeof selector) {
            let els = document.querySelectorAll(selector);
            els.forEach(el => {
                el.addEventListener('keyup', (evt) => {
                    if (13 == evt.keyCode) {
                        callbackFn(el);
                    }
                });
            });

            return;
        }


        //배열
        if (Array.isArray(selector)) {
            let arr = selector;
            arr.forEach(selector => {
                VV.addEnterListener(selector);
            });
        }
    }


    /**
     * 클래스 추가
     *  예)VV.addClass('input#id', 'd-none');
     *  예)VV.addClass(['input#id', 'input#pw'], 'd-none');
     *  예)VV.addClass(documqnt.querySelector('input#id'), 'd-none');
     *  예)VV.addClass(documqnt.querySelectorAll('input'), 'd-none');
     * @param {string|string[]|Element|Element[]} selector
     * @param {*} className
     */
    static addClass(selector, className) {
        VV.Ui.toElements(selector).forEach(el => {
            if (VV.hasClass(el, className)) {
                return;
            }

            el.classList.add(className);
        });
    }


    /**
     * class 제거
     *  예)VV.removeClass('input#id', 'd-none');
     *  예)VV.removeClass(['input#id', 'input#pw'], 'd-none');
     *  예)VV.removeClass(documqnt.querySelector('input#id'), 'd-none');
     *  예)VV.removeClass(documqnt.querySelectorAll('input'), 'd-none');
     * @param {string|string[]|Element|Element[]} selector
     * @param {string} className 클래스명
     */
    static removeClass(selector, className) {
        VV.Ui.toElements(selector).forEach(el => {
            el.className.remove(className);
        });
    }


    /**
     * 클래스가 존재하는지 여부
     *  예)VV.hasClass('input#id', 'd-none');
     *  예)VV.hasClass(['input#id', 'input#pw'], 'd-none');
     *  예)VV.hasClass(documqnt.querySelector('input#id'), 'd-none');
     *  예)VV.hasClass(documqnt.querySelectorAll('input'), 'd-none');
     * @param {string|string[]|Element|Element[]} selector
     * @param {string} className 클래스명
     */
    static hasClass(selector, className) {
        VV.Ui.toElements(selector).forEach(el => {
            let b = false;
            el.classList.forEach(x => {
                b |= (x === className);
            });

            return b;
        });
    }


    /**
     * 토글 클래스
     *  예)VV.toggleClass('input#id', 'd-none')
     *  예)VV.toggleClass(['input#id', 'input#pw'], 'd-none')
     *  예)VV.toggleClass(document.querySelector('input#id'), 'd-none')
     *  예)VV.toggleClass(document.querySelectorAll('input'), 'd-none')
     * @param {string|string[]|Element|Element[]} selector
     * @param {string} className 클래스명
     */
    static toggleClass(selector, className) {
        VV.Ui.toElements(selector).forEach(el => {
            if (VV.hasClass(el, className)) {
                VV.removeClass(el, className);
            } else {
                VV.addClass(el, className);
            }
        });
    }


    /**
     * 엘리먼트 생성
     * 예)VV.createElement('input', {'id':'아이디', 'name':'명', 'value':'값'});
     * @param {string} tagName 태그 명
     * @param {object} opt 옵션
     *  key : 엘리먼트에 추가할 attribute명
     *  value : attribute에 해당하는 값
     */
    static createElement(tagName, opt = null) {
        let el = document.createElement(tagName);

        if (VV.isNull(opt)) {
            return el;
        }

        Object.keys(opt).forEach(k => {
            el.setAttribute(k, opt[k]);
        });

        return el;
    }


    /**
     * form 생성 & form에 element추가
     * 예)VV.createForm('f123', [VV.createElement('input', {'type':'hidden', 'value':'값'})]);
     * @param {string} id
     * @param {Element[]} els
     */
    static createForm(id, els = null) {
        let form = document.createElement('form');
        form.setAttribute('id', id);

        if (VV.isNull(els)) {
            return form;
        }


        els.forEach(el => {
            form.appendChild(el);
        });

        return form;
    }


    /**
     * 값이 존재하면 선택자에 값 할당
     * 값이 존재하지 않으면 선택자의 값 리턴
     * value attribute가 존재하는 element에만 해당
     * 값 리턴시 배열의 갯수가 1개 이면 scalar로 리턴, 1보다 크면 배열로 리턴
     *  예)VV.Ui.val('input#id')
     *  예)VV.Ui.val('input#id', '값')
     *  예)VV.Ui.val(['input#id', 'input#pw'])
     *  예)VV.Ui.val(['input#id', 'input#pw'], '값')
     *  예)VV.Ui.val(document.querySelector('input#id'))
     *  예)VV.Ui.val(document.querySelector('input#id'), '값')
     *  예)VV.Ui.val(document.querySelectorAll('input'))
     *  예)VV.Ui.val(document.querySelectorAll('input'), '값')
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {string|number} v 값 선택 기본:null
     * @returns {string[]|void} 값이 존재하면 리턴값 없음
     */
    static val(selector, v = null) {
        if (VV.isNull(v)) {
            let arr = [];

            //값 리턴
            VV.Ui.toElements(selector).forEach(el => {
                if (VV.isNull(el.value)) {
                    return;
                }

                arr.push(el.value);
            });

            return (1 === arr.length ? arr[0] : arr);
        }


        //값 할당
        VV.Ui.toElements(selector).forEach(el => {
            el.value = v;
        });

    }


    static html(selector, v = null) {
        let arr = [];

        VV.Ui.toElements(selector).forEach(el => {
            if (VV.isNull(v)) {
                arr.push(el.innerHTML);
                return;
            }

            el.innerHTML = v;
        });

        return (1 == arr.length ? arr[0] : arr);
    }


    static closest(selector, parentSelector) {
        VV.Ui.toElements(selector).forEach(el => {
            el.parentElement.tagName === parentTagName
        });
    }


    //begin manipulation

    /**
     * inline style 설정하거나 값 추출
     * v값 존재하면 값 설정
     * v값 존재하지 않으면 값 추출
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {string} propertyName 프로퍼티 명
     * @param {string|number} v 값
     * @returns {string|string[]|void} 리턴값이 1개이면 string, 2개 이상이면 string[], v값 존재하면 void
     */
    static css(selector, propertyName, v = null) {
        if (VV.Ui.isNull(v)) {
            //값 리턴
            let arr = [];

            VV.Ui.toElements(selector).forEach(el => {
                let s = el.style[VV.camelize(propertyName)];
                arr.push(s);
            });

            return (1 === arr.length ? arr[0] : arr);
        }


        //값 할당
        VV.Ui.toElements(selector).forEach(el => {
            el.style[VV.camelize(propertyName)] = v;
        });
    }


    /**
     * element의 내용 지우기
     * @param {string|string[]|Element|Element[]} selector 선택자
     */
    static empty(selector) {
        VV.Ui.toElements(selector).forEach(el => {
            el.innerHTML = '';
        });
    }


    /**
     * element 삭제
     * @param {string|string[]|Element|Element[]} selector 선택자
     */
    static remove(selector) {
        VV.Ui.toElements(selector).forEach(el => {
            el.remove();
        });
    }


    //end manipulation


    /**
     * element hide
     * @param {string|string[]|Element|Element[]} selector 선택자
     */
    static hide(selector) {
        VV.Ui.toElements(selector).forEach(el => {
            el.style.display = 'none';
        });
    }


    /**
     * element show
     * @param {string|string[]|Element|Element[]} selector 선택자
     */
    static show(selector) {
        VV.Ui.toElements(selector).forEach(el => {
            el.style.display = 'block';
        });
    }


    /**
     * show인 element는 hide처리, hide인 element는 show처리
     * @param {string|string[]|Element|Element[]} selector 선택자
     */
    static toggle(selector) {
        VV.Ui.toElements(selector).forEach(el => {
            if ('none' === VV.Ui.css(el, 'display')) {
                VV.Ui.show(el);
            } else {
                VV.Ui.hide(el);
            }
        });
    }


    //begin fade in/out


    /**
     * fade in/out 처리
     * @param {Element} el 엘리먼트
     * @param {string} type 타입. in|out
     * @param {number} durationMs 지연시간, 단위:밀리초
     */
    static _fade(el, type, durationMs) {
        let opacity = ('in' === type) ? 0 : 1;
        let interval = 50;
        let gap = interval / durationMs;

        if ('in' === type) {
            el.style.display = 'inline';
            el.style.opacity = 0;
        }

        let fading = window.setInterval(function () {
            if ('in' === type) {
                opacity += gap;
            } else {
                opacity -= gap;
            }
            el.style.opacity = opacity;

            if (0 >= opacity) {
                el.style.display = 'none';
            }
            if (0 >= opacity || opacity >= 1) {
                window.clearInterval(fading);
            }
        }, interval);
    }


    /**
     *
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {number} durationMs 지연시간, 단위:밀리초, 선택, 기본:1초
     */
    static fadeIn(selector, durationMs = 1000) {
        VV.Ui.toElements(selector).forEach(el => {
            VV.Ui._fade(el, 'in', durationMs);
        });
    }


    /**
     *
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {number} durationMs 지연시간, 단위:밀리초, 선택, 기본:1초
     */
    static fadeOut(selector, durationMs = 1000) {
        VV.Ui.toElements(selector).forEach(el => {
            VV.Ui._fade(el, 'out', durationMs);
        });
    }


    /**
     * fade in/out toggle
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {number}} durationMs 지연시간, 단위:밀리초, 선택, 기본:1초
     */
    static fadeToggle(selector, durationMs = 1000) {
        VV.Ui.toElements(selector).forEach(el => {
            if (0 >= el.style.opacity) {
                VV.Ui.fadeIn(el, durationMs);
                return;
            }

            if (1 <= el.style.opacity) {
                VV.Ui.fadeOut(el, durationMs);
                return;
            }
        });
    }

    //end fade in/out


    /**
     * 이벤트 제거
     * @param {select|string[]|Element|Element[]} selector 선택자
     * @param {string} type 이벤트 타입. click|change|...
     * @param {function} listener 리스너 함수
     */
    static off(selector, type, listener) {
        VV.Ui.toElements(selector).forEach(el => {
            el.removeEventListener(type, listener);
        });
    }


    /**
     * 이벤트 설정
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {string} type 이벤트 타입. click|change|...
     * @param {function} listener 리스너 함수
     */
    static on(selector, type, listener) {
        if ('click' === type) {
            VV.Ui.click(selector, listener);
            return;
        }

        if ('change' === type) {
            VV.Ui.change(selector, listener);
        }
    }

    //begin mouse event


    /**
     * 클릭 이벤트 설정
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {function} listener 리스너 함수
     */
    static click(selector, listener) {
        VV.Ui.toElements(selector).forEach(el => {
            el.addEventListener('click', listener);
        });
    }


    /**
     * change 이벤트 설정
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {function} listener 리스너 함수
     */
    static change(selector, listener) {
        VV.Ui.toElements(selector).forEach(el => {
            el.addEventListener('change', listener);
        });
    }

    //end mouse event


    //begin key event


    /**
     * keyup 이벤트 등록
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {function} listener 리스너 함수
     */
    static keyup(selector, listener) {
        VV.Ui.toElements(selector).forEach(el => {
            el.addEventListener('keyup', listener);
        });
    }


    /**
     * keypress 이벤트 등록
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {function} listener 리스너 함수
     */
    static keypress(selector, listener) {
        VV.Ui.toElements(selector).forEach(el => {
            el.addEventListener('keypress', listener);
        });
    }


    /**
     * keyup 이벤트 등록
     * @param {string|string[]|Element|Element[]} selector 선택자
     * @param {function} listener 리스너 함수
     */
    static keyup(selector, listener) {
        VV.Ui.toElements(selector).forEach(el => {
            el.addEventListener('keyup', listener);
        });
    }

    //end key event

    //begin form


    /**
     * form의 element name/value를 배열로 리턴
     *  예)VV.Ui.serializeArray('form:eq(1)') => [{'name':'id', value:'값'}]
     */
    static serializeArray(selector) {
        let arr = [];


        VV.Ui.toElements(selector).forEach(el => {
            VV.Ui.getAllChildren(el).forEach(elem => {
                if (VV.isNull(elem.name)) {
                    return;
                }

                arr.push({
                    'name': elem.getAttribute('name'),
                    'value': elem.value ?? ''
                });
            });
        });

        return arr;
    }


    static serializeObject(selector) {
        let json = {};

        VV.Ui.serializeArray(selector).forEach(x => {
            json[x.name] = x.value;
        });

        return json;
    }


    /**
     * 모든 자식 element를 1차원배열로 리턴
     * @param {Element} el
     * @returns {Element[]} element목록
     */
    static getAllChildren(el) {
        let arr = [el];


        for (let i = 0; i < el.children.length; i++) {
            arr = [].concat(arr, VV.Ui.getAllChildren(el.children[i]));
        }


        return arr;
    }

    //end form


    /**
     *
     * @param {string|string[]|Element|Element[]} selector
     */
    static bindDatas(selector, datas) {

    }


    /**
     * gpu 관련 정보 추출
     *  리턴예)ANGLE (NVIDIA, NVIDIA GeForce RTX 2060 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5671)
     * @see https://gist.github.com/cvan/042b2448fcecefafbb6a91469484cdf8#file-webgl-detect-gpu-js
     * @returns {string}
     */
    static getGpuRenderer() {
        let canvas = document.createElement('canvas');
        let gl = null;
        try {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        } catch (e) {
        }

        if (VV.isNull(gl)) {
            return '';
        }

        let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        return renderer;
    }


    /**
     * 클라이언트의 모든 정보 리턴
     * 해상도, 브라우저, cpu, os, device, gpu
     * 의존성 : ua-parser.js 필요
     * @returns {object}
     */
    static getAllClientInfo() {
        let json = {};

        json.screenWidth = screen.width;
        json.screenHeight = screen.height;

        json.gpuRenderer = VV.Ui.getGpuRenderer();

        try {
            let parser = new UAParser();

            json.browserName = parser.browser.name;
            json.browserVersion = parser.browser.version;
            json.cpu = parser.cpu.architecture;
            json.osName = parser.os.name;
            json.osVersion = parser.os.version;
            json.deviceVender = parser.device.vender ?? '';
            json.deviceModel = parser.device.model ?? '';
            json.deviceType = parser.device.type ?? ''
        } catch (e) {
        }

        return json;
    }
}
