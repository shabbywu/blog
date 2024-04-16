<template>
    <div class="wrapper">
        <div class="sidebar-wrapper">
            <div class="profile-container">

                <h1 class="name">伍镜滔</h1>
                <h3 class="tagline">全栈程序员</h3>
            </div><!--//profile-container-->
            
            <div class="contact-container container-block">
                <ul class="list-unstyled contact-list">
                    <li class="email"><i class="fa-solid fa-envelope"></i><a href="mailto: shabbywu@qq.com">shabbywu@qq.com</a></li>
                    <li class="phone"><i class="fa-solid fa-phone"></i><a href="tel:+86 18620447891">+86 18620447891</a></li>
                    <li class="website"><i class="fa-solid fa-globe"></i><a href="https://blog.shabbywu.cn/" target="_blank">blog.shabbywu.cn</a></li>
                    <li class="github"><i class="fa-brands fa-github"></i><a href="#" target="_blank">github.com/shabbywu</a></li>
                    <!-- <li class="twitter"><i class="fa-brands fa-twitter"></i><a href="https://twitter.com/3rdwave_themes" target="_blank">@twittername</a></li> -->
                </ul>
            </div><!--//contact-container-->
            <div class="education-container container-block">
                <h2 class="container-block-title">教育经历</h2>
                <div class="item">
                    <h4 class="degree">本科</h4>
                    <h5 class="meta">华南理工大学</h5>
                        <div class="time">2015 - 2019</div>
                </div><!--//item-->
            </div><!--//education-container-->
            
            <div class="languages-container container-block">
                <h2 class="container-block-title">语言</h2>
                <ul class="list-unstyled interests-list">
                    <li>Chinese <span class="lang-desc">(Native)</span></li>
                    <li>Cantonese <span class="lang-desc">(Native)</span></li>
                    <li>English <span class="lang-desc">(Good working knowledge)</span></li>
                </ul>
            </div><!--//interests-->
            
            <div class="interests-container container-block">
                <h2 class="container-block-title">兴趣</h2>
                <ul class="list-unstyled interests-list">
                    <li>电子游戏</li>
                </ul>
            </div><!--//interests-->
            
        </div><!--//sidebar-wrapper-->
        
        <div class="main-wrapper">
            
            <section class="section summary-section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-user"></i></span>简介</h2>
                <div class="summary">
                    <p style="margin-bottom: 0px;">
                        软件工程师，5年以上全栈开发经验，精通 Python 和容器技术，有JavaScript、Vue和 CI/CD 经验。主要参与开发和维护腾讯游戏运营体系的基石之一--蓝鲸智云 PaaS 平台。
                    </p>
                </div><!--//summary-->
            </section><!--//section-->
            
            <section class="section experiences-section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-briefcase"></i></span>工作经历</h2>
                
                <div class="item">
                    <div class="meta">
                        <div class="upper-row">
                            <h3 class="job-title">高级工程师</h3>
                            <div class="time">2019 - Present</div>
                        </div><!--//upper-row-->
                        <div class="company">腾讯, 深圳</div>
                    </div><!--//meta-->
                    <div class="details">

                    </div><!--//details-->
                </div><!--//item-->
            </section><!--//section-->
            
            <section class="section projects-section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-archive"></i></span>项目</h2>
                <div class="item">
                    <span class="project-title"><a href="https://github.com/TencentBlueKing/blueking-paas" target="_blank">Blueking PaaS</a></span> - <span class="project-tagline">蓝鲸智云 PaaS 平台是一个开放式的开发平台，在腾讯内部托管运行着上千个 SaaS 应用。我在项目中充当主要开发，基本上所有的核心功能如应用构建与部署、集群管理、接入层管理、日志查询等都由我主导开发。</span>
                </div><!--//item-->

                <div class="item">
                    <span class="project-title"><a href="javascript:void(0);">paas-analysis</a></span> - <span class="project-tagline">paas-analysis 是一个轻量级的访问统计项目(Page View), 后端使用 Fastapi、Redis 和 Lua(OpenResty) 开发。</span>
                </div><!--//item-->

                <div class="item">
                    <span class="project-title"><a href="javascript:void(0);">Career Homepage</a></span> - <span class="project-tagline">Career Homepage 是腾讯 IEG 技术运营部内的职员画像系统。该系统以蓝鲸运维基础数据平台为基座, 使用可配置的指标计算系统从海量自动化、运维开发、DevOps、AIOps四个维度量化职员能力。</span>
                </div><!--//item-->

                <hr/>

                <div class="item">
                    <span class="project-title"><a href="https://github.com/shabbywu/distribution" target="_blank">moby-distribution</a></span> - <span class="project-tagline">moby-distribution 是一个使用 python 开发的, 用于操作 Docker Image Manifest 和 Blob（Layers、Config 等）的库。</span>
                </div><!--//item-->
                <div class="item">
                    <span class="project-title"><a href="https://github.com/shabbywu/Battle-Brothers-CN" target="_blank">Battle-Brothers-CN</a></span> - <span class="project-tagline">Battle-Brothers-CN 是游戏 <a href="https://store.steampowered.com/app/365360/Battle_Brothers/">Battle Brothers</a> 的本地化项目, 该项目的运维完全基于自动化的 CI/CD 工具。</span>
                </div><!--//item-->
            </section><!--//section-->
            
            <section class="skills-section section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-rocket"></i></span>技能 &amp; 熟练度</h2>
                <div class="skillset">        
                    <div class="item">
                        <h3 class="level-title">Python &amp; Django</h3>
                        <div class="progress level-bar">
                            <div class="progress-bar theme-progress-bar" role="progressbar" style="width: 99%" aria-valuenow="99" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>                               
                    </div><!--//item-->

                    <div class="item">
                        <h3 class="level-title">Docker &amp; K8s</h3>
                        <div class="progress level-bar">
                            <div class="progress-bar theme-progress-bar" role="progressbar" style="width: 90%" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>                                  
                    </div><!--//item-->

                    <div class="item">
                        <h3 class="level-title">CI/CD &amp; GitOps</h3>
                        <div class="progress level-bar">
                            <div class="progress-bar theme-progress-bar" role="progressbar" style="width: 80%" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>                                 
                    </div><!--//item-->
                    
                    <div class="item">
                        <h3 class="level-title">Javascript & Vue</h3>
                        <div class="progress level-bar">
                            <div class="progress-bar theme-progress-bar" role="progressbar" style="width: 80%" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>                              
                    </div><!--//item-->
                    
                    <div class="item">
                        <h3 class="level-title">MySQL &amp; Redis</h3>
                        <div class="progress level-bar">
                            <div class="progress-bar theme-progress-bar" role="progressbar" style="width: 70%" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>                                 
                    </div><!--//item-->

                </div>  
            </section><!--//skills-section-->
            
        </div><!--//main-body-->
    </div>
</template>


<script setup>
import {onMounted} from "vue"
import "bootstrap/dist/css/bootstrap.min.css"

import "./fonts.css"
import "./scss/orbit-1.scss"

onMounted(async () => {
    await import("bootstrap");
})
</script>