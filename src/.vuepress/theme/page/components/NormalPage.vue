<template>
<div>
    <component :is="Render">
<div class="blog-page">
    <main id="main-content" class="blog-main">
        <div class="blog-post custom">
            <section class="post-meta main-div">
                <div class="post-date"><span>{{ themeLocale.metaLocales.date }}：</span> <DateInfo :date="info.date" :localizedDate="info.localizedDate" ></DateInfo></div>
                <div v-if="prevPage" class="post-links">
                <router-link :to="prevPage.path"><span>{{ themeLocale.metaLocales.prevPost }}：</span><span> {{ prevPage.title }}</span></router-link>
                </div>
                <div v-if="nextPage" class="post-links">
                <router-link :to="nextPage.path"><span>{{ themeLocale.metaLocales.prevPost }}：</span><span> {{ nextPage.title }}</span></router-link>
                </div>
            </section>
            <article class="blog-post-content main-div">
                <PageTitle></PageTitle>
                <MarkdownContent id="markdown-content"></MarkdownContent>
            </article>
            <section class="post-meta main-div">
                <div class="post-date"><span>{{ themeLocale.metaLocales.date }}：</span> <DateInfo :date="info.date" :localizedDate="info.localizedDate" ></DateInfo></div>
                <div v-if="prevPage" class="post-links">
                <a :href="prevPage.path"><span>{{ themeLocale.metaLocales.prevPost }}：</span><span> {{ prevPage.title }}</span></a>
                </div>
                <div v-if="nextPage" class="post-links">
                <a :href="nextPage.path"><span>{{ themeLocale.metaLocales.prevPost }}：</span><span> {{ nextPage.title }}</span></a>
                </div>
            </section>
            <CommentService v-if="hasCommentService" :darkmode="isDarkmode" class="blog-post-comments"></CommentService>
        </div>
    </main>
    <aside class="blog-aside" v-if="tocEnable">
        <BloggerInfo class="main-div"></BloggerInfo>
        <section class="main-div sticky">
        <TOC :headerDepth="frontmatter.value?.headerDepth ?? themeLocale.value?.headerDepth ?? 2">
            <template v-slot:after v-if="hasCommentService">
                <div class="toc-comment">
                    <a href="#comment"><FontIcon icon="comment"></FontIcon> {{ themeLocale.metaLocales.comments }}</a>
                </div>
            </template>
        </TOC>
        </section>
    </aside>
</div>
</component>
</div>
</template>
<script setup lang="ts">
import "vuepress-theme-hope/styles/page.scss";
import "./page.scss";

import { computed, onUpdated, reactive } from "vue";
import { usePages } from '@temp/pages'
import { usePageData, usePageFrontmatter } from "vuepress/client";
import { hasGlobalComponent } from "@vuepress/helper/client";

import { usePageInfo, useThemeLocaleData } from "@theme-hope/composables/index";
import { useDarkmode } from "@theme-hope/modules/outlook/composables/index";

import PageTitle from "@theme-hope/components/PageTitle";
import DateInfo from "@theme-hope/modules/info/components/DateInfo";
import TOC from "@theme-hope/modules/info/components/TOC";
import BloggerInfo from "@theme-hope/modules/blog/components/BloggerInfo";
import MarkdownContent from "@theme-hope/components/MarkdownContent";

const frontmatter = usePageFrontmatter();
const { isDarkmode } = useDarkmode();
const themeLocale = useThemeLocaleData();
const tocEnable = computed(() => frontmatter.value.toc ||
    (frontmatter.value.toc !== false && themeLocale.value.toc !== false));


const { info } = usePageInfo();
const Render = hasGlobalComponent("LocalEncrypt")? "LocalEncrypt": "RenderDefault";
const hasCommentService = hasGlobalComponent("CommentService");
const _pages = usePages();
const pageData = usePageData();


const pages = _pages.filter(page => {
    if (themeLocale.value.lang == "zh-CN") {
        return page.path.startsWith("/posts");
    } else {
        return page.path.startsWith("/en/posts");
    }
})


const currentPageIndex = computed(() => {
    return pages.findIndex(p => p.filePathRelative === pageData.value.filePathRelative);
})

const prevPage = computed(() => {
    const prevPageIndex = currentPageIndex.value + 1;
    return prevPageIndex > pages.length - 1 ? null : pages[prevPageIndex];
})
const nextPage = computed(() => {
    const nextPageIndex = currentPageIndex.value - 1;
    return nextPageIndex < 0 ? null : pages[nextPageIndex];
})

onUpdated(() => {
    
})

</script>
