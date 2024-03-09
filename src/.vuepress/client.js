import Layout from "./theme/blog/layouts/Layout.ts"
import { defineClientConfig } from 'vuepress/client'


export default defineClientConfig({
    layouts: {
        Layout: Layout,
    }
})