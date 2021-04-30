/**
 * 헬로 - 상세
 */
class Detail {
    /**
     * 생성자
     */
    constructor() {

    }


    /**
     * 초기
     */
    init() {
        this.setEventHandler();

    }


    /**
     * 이벤트 등록
     */
    setEventHandler() {
        let self = this;


        //수정
        VV.Ui.click('button.updt-form', () => {
            self.updtForm();
        });

        //삭제
        VV.Ui.click('button.delete', () => {
            self.delete();
        });


        //목록
        VV.Ui.click('button.list', () => {
            self.list();
        });

    }


    /**
     * 수정폼으로 이동
     */
    updtForm() {
        location.href = `./updt-form?id=${this.getId()}`;
    }

    /**
     * 삭제 처리
     */
    delete() {
        let self = this;

        if (!confirm('삭제하시겠습니까?')) {
            return;
        }

        //삭제 요청
        VV.Ajax.delete(`../rest/hellos/${this.getId()}`, null, () => {
            self.list();
        });
    }


    /**
     * 목록 화면으로 이동
     */
    list() {
        location.href = './list';
    }


    /**
     * 아이디값 구하기
     * @returns {string}
     */
    getId() {
        return VV.Ui.val('input[name=id]');
    }
}