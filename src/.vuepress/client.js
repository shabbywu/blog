import Layout from "./theme/blog/layouts/Layout.ts"
import ResumeLayout from "./theme/blog/layouts/ResumeLayout.ts"
import { defineClientConfig } from 'vuepress/client'


export default defineClientConfig({
    layouts: {
        Layout: Layout,
        ResumeLayout: ResumeLayout,
    },
})