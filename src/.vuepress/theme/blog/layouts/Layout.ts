import { defineComponent, h } from "vue";
import { usePageData, usePageFrontmatter } from "vuepress/client";
import BlogHome from "@theme-hope/modules/blog/components/BlogHome";
import NormalPage from "@theme-hope/components/NormalPage";
import FadeSlideY from "@theme-hope/components/transitions/FadeSlideY";
import CommonWrapper from "@theme-hope/components/CommonWrapper";


export default defineComponent({
    name: "Layout",
    slots: Object,
    setup(_props, { slots }) {
        const page = usePageData();
        const frontmatter = usePageFrontmatter();

        return () => h(CommonWrapper, {}, {
            default: () => slots.default?.() || h(FadeSlideY, () => h(frontmatter.value.home? BlogHome : NormalPage, { key: page.value.path }))
        });
    }
});