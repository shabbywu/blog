import { defineComponent, h } from "vue";
import { usePageData, usePageFrontmatter } from "vuepress/client";
import FadeSlideY from "@theme-hope/components/transitions/FadeSlideY";
import { RenderDefault } from "vuepress-shared/client";
import { Content } from "vuepress/client";


export default defineComponent({
    name: "ResumeLayout",
    slots: Object,
    setup(_props, { slots }) {
        return () => h(RenderDefault, {}, {
            default: () => slots.default?.() || h(FadeSlideY, () => h(Content, {style: {height: "100%"}}))
        });
    }
});