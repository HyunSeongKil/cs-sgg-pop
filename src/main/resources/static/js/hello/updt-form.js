/**
 * 수정 폼
 */
class UpdtForm {
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
        VV.Ui.click('button.updt', () => {
            self.updt();
        });


        //취소
        VV.Ui.click('button.cancel', () => {
            self.cancel();
        });
    }


    /**
     * 수정
     */
    updt() {
        let self = this;


        if (!confirm('수정하시겠습니까?')) {
            return;
        }


        let data = VV.Ui.serializeObject('form#f');

        VV.Ajax.put(`../rest/hellos`, data, () => {
            toastr.info('수정되었습니다.');
            self.cancel();
        });
    }


    /**
     * 취소
     */
    cancel() {
        location.href = `./detail?id=${this.getId()}`;
    }


    /**
     * 아이디 구하기
     * @returns {string}
     */
    getId() {
        return VV.Ui.val('input[name=id]');
    }
}