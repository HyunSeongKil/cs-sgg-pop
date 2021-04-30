package kr.vaiv.sdt.cssggpop.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/cesium")
public class CesiumController {

    @GetMapping("/cs-sgg-pop")
    public String csSggPop(){

        return "cesium/cs-sgg-pop";
    }
}
