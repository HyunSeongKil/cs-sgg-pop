/**
 * 헬로 - 등록 폼
 */
class RegistForm {
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

        //등록 버튼 클릭
        VV.Ui.click('button.regist', () => {
            self.regist();
        });


        //취소 버튼 클릭
        VV.Ui.click('button.cancel', () => {
            self.cancel();
        });
    }


    /**
     *
     * @returns 등록
     */
    regist() {
        let self = this;


        if (!confirm('등록하시겠습니까?')) {
            return;
        }

        let json = VV.Ui.serializeObject('form#f');

        //등록 처리
        VV.Ajax.post('../rest/hellos', json, () => {
            toastr.info('등록되었습니다.');

            self.cancel();
        });
    }


    /**
     * 취소
     */
    cancel() {
        location.href = './list';
    }
}