import noopComponent from "@vuepress/helper/noopComponent";
import { computed, defineComponent, h, ref, resolveComponent } from "vue";
import { hasGlobalComponent } from "@vuepress/helper/client";
import { usePageData } from "vuepress/client";
import GeoPattern from 'geopattern';

import { useThemeLocaleData, useWindowSize, } from "vuepress-theme-hope/composables/index";
import LanguageDropdown from "vuepress-theme-hope/modules/navbar/components/LanguageDropdown";
import NavScreen from "vuepress-theme-hope/modules/navbar/components/NavScreen";
import NavbarBrand from "vuepress-theme-hope/modules/navbar/components/NavbarBrand";
import NavbarLinks from "vuepress-theme-hope/modules/navbar/components/NavbarLinks";
import RepoLink from "vuepress-theme-hope/modules/navbar/components/RepoLink";
import ToggleNavbarButton from "vuepress-theme-hope/modules/navbar/components/ToggleNavbarButton";
import ToggleSidebarButton from "vuepress-theme-hope/modules/navbar/components/ToggleSidebarButton";
import OutlookButton from "vuepress-theme-hope/modules/outlook/components/OutlookButton";
import "vuepress-theme-hope/modules/navbar/styles/navbar.scss";
import "./navbar.scss"


const generators = [
    'octogons',
    'overlappingCircles',
    'plusSigns',
    'xes',
    // 'sineWaves',
    'hexagons',
    'overlappingRings',
    // 'plaid',
    'triangles',
    // 'squares',
    'concentricCircles',
    'diamonds',
    'tessellation',
    // 'nestedSquares',
    'mosaicSquares',
    'chevrons',
];


export default defineComponent({
    name: "NavBar",
    emits: ["toggleSidebar"],
    slots: Object,
    setup(_props, { emit, slots }) {
        const page = usePageData();
        const themeLocale = useThemeLocaleData();
        const { isMobile } = useWindowSize();
        const showScreen = ref(false);
        const autoHide = computed(() => {
            const { navbarAutoHide = "mobile" } = themeLocale.value;
            return (navbarAutoHide !== "none" &&
                (navbarAutoHide === "always" || isMobile.value));
        });
        const navbarLayout = computed(() => themeLocale.value.navbarLayout ||
            {
                start: ["Brand"],
                center: ["Links"],
                end: ["Language", "Repo", "Outlook", "Search"],
            });
        const navbarComponentMap = {
            Brand: NavbarBrand,
            Language: HAS_MULTIPLE_LANGUAGES ? LanguageDropdown : noopComponent,
            Links: NavbarLinks,
            Repo: RepoLink,
            Outlook: OutlookButton,
            Search: hasGlobalComponent("Docsearch")
                ? resolveComponent("Docsearch")
                : hasGlobalComponent("SearchBox")
                    ? resolveComponent("SearchBox")
                    : noopComponent,
        };
        const gpString = (): string => {
            return (page.value.title || '') + (new Date()).toString()
        }
        const gpImg = (): string => {
            return GeoPattern.generate(gpString(), {
                generator: generators[Math.floor(Math.random() * generators.length)]
            }).toDataUrl()
        }

        const getNavbarComponent = (component) => navbarComponentMap[component] ??
            (hasGlobalComponent(component)
                ? resolveComponent(component)
                : noopComponent);
        return () => [
            h("header", {
                id: "header",
                class: [
                    "vp-header",
                    {
                        "auto-hide": autoHide.value,
                        "hide-icon": themeLocale.value.navbarIcon === false,
                    },
                ],
                style: {
                    "background-image": gpImg(),
                }
            }, [
                h("div", {
                    class: "vp-navbar-container"
                }, [
                        h("div", { class: "vp-navbar-start" }, [
                            h(ToggleSidebarButton, {
                                onToggle: () => {
                                    if (showScreen.value)
                                        showScreen.value = false;
                                    emit("toggleSidebar");
                                },
                            }),
                            slots.startBefore?.(),
                            (navbarLayout.value.start || []).map((item) => h((getNavbarComponent(item)))),
                            slots.startAfter?.(),
                        ]),
                        h("div", { class: "vp-navbar-center" }, [
                            slots.centerBefore?.(),
                            (navbarLayout.value.center || []).map((item) => h((getNavbarComponent(item)))),
                            slots.centerAfter?.(),
                        ]),
                        h("div", { class: "vp-navbar-end" }, [
                            slots.endBefore?.(),
                            (navbarLayout.value.end || []).map((item) => h((getNavbarComponent(item)))),
                            slots.endAfter?.(),
                            h(ToggleNavbarButton, {
                                active: showScreen.value,
                                onToggle: () => {
                                    showScreen.value = !showScreen.value;
                                },
                            }),
                        ]),
                    ]
                ),
                h("div", {
                    class: "banner"
                }, [
                    h("h1", {class: "text"}, [page.value.title])
                ])
            ]),
            h(NavScreen, {
                show: showScreen.value,
                onClose: () => {
                    showScreen.value = false;
                },
            }, {
                before: () => slots.screenTop?.(),
                after: () => slots.screenBottom?.(),
            }),
        ];
    },
});
//# sourceMappingURL=Navbar.js.map