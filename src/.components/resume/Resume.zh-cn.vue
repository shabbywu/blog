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
                    <li class="github"><i class="fa-brands fa-github"></i><a href="https://github.com/shabbywu" target="_blank">github.com/shabbywu</a></li>
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
                    <li>中文 <span class="lang-desc">(母语)</span></li>
                    <li>粤语 <span class="lang-desc">(母语)</span></li>
                    <li>英语 <span class="lang-desc">(工作交流)</span></li>
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
                        软件工程师，5年以上全栈开发经验，精通 Python，熟悉 Golang 、容器技术 和 C++ 开发，有较丰富的 JavaScript、Vue和 CI/CD 经验。在腾讯工作期间主要参与开发和维护蓝鲸智云 PaaS 平台。
                    </p>
                </div><!--//summary-->
            </section><!--//section-->
            
            <section class="section experiences-section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-briefcase"></i></span>工作经历</h2>
                
                <div class="item">
                    <div class="meta">
                        <div class="upper-row">
                            <h3 class="job-title">高级工程师</h3>
                            <div class="time">2019 - 2024</div>
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
                    <div class="project-title">
                        <span class="darken">名称: </span>
                        <div class="detail">
                            <a href="https://github.com/TencentBlueKing/blueking-paas" target="_blank">Blueking PaaS</a>
                            <span class="timetag">2019-2024</span>
                        </div>
                    </div>
                    <div class="project-description">
                        <span class="darken">描述: </span>
                        <div class="detail">蓝鲸智云 PaaS 平台是一个开放式的开发平台，在腾讯内部托管运行着 1600+ SaaS 应用。该项目的 Web API 使用 Django(DRF) 和 Celery 开发, 应用构建依托于 Cloud Native Buildpacks 和 Kaniko, 应用运行生命周期使用 K8S Operator(Golang) 管理。接入层使用 Nginx Ingress 作流量转发, 支持常规 ELK 方案和蓝鲸自研日志采集器采集日志。</div>
                    </div>
                    <div class="project-roleblock">
                        <div class="darken">职责: </div>
                        <div class="detail">
                            <!-- <div class="project-roleline">我在该项目的角色是后台开发，基本上所有的核心功能如应用构建与部署、应用离线交付方案、接入层管理、日志采集与查询等都由我主导开发。</div> -->
                            <div class="project-roleline">※ 设计从源码到构建的执行流程和数据存储结构, 实现从二进制制品到云原生容器镜像的构建系统的无缝升级。</div>
                            <div class="project-roleline">※ 设计应用(SaaS)离线交付方案和构建工具, 支持以镜像层为粒度交付应用(SaaS)的镜像。通过自研的镜像层合并方案降低容器镜像的交付体积。</div>
                            <div class="project-roleline">※ 运用设计原则和对模板、组合、策略等设计模式的综合使用, 搭建了同时支持 ELK 和蓝鲸日志平台的日志采集、查询链路；搭建了支持 git/svn/容器镜像的应用源码(或镜像)的源码拉取模块。</div>
                            <div  class="project-roleline">※ 设计了一套用于开发后台管理页面的开发流程，不仅可以用 Vue 还能使用 Django 的 Server Side Rendering, 降低了 80% 后台管理页面的接口开发复杂度。</div>
                        </div>
                    </div>
                </div><!--//item-->

                <div class="item">
                    <div class="project-title">
                        <span class="darken">名称: </span>
                        <div class="detail">
                            <a href="javascript:void(0);">Career Homepage</a>
                            <span class="timetag">2020-2024</span>
                        </div>
                    </div>

                    <div class="project-description">
                        <span class="darken">描述: </span>
                        <div class="detail">Career Homepage 是腾讯 IEG 技术运营部内的职员画像系统。该系统以蓝鲸运维基础数据平台为基座, 使用可配置的指标计算系统从海量自动化、运维开发、DevOps、AIOps四个维度量化职员能力, 每个绩效评估周期都会用于评估技术营业部 500+ 职员能力。</div>
                    </div>

                    <div class="project-roleblock">
                        <div class="darken">职责: </div>
                        <div class="detail">
                            <!-- <div class="project-roleline">我在该项目的角色是后台开发，主要负责与产品讨论和分析需求，设计实现方案、完成代码开发以及与前端联调。</div> -->
                            <div class="project-roleline">※ 设计一套可配置、易扩展、支持组合计算的指标计算与查询模块。此方案经历数次考核方案大变动，仍可满足最终的业务场景。</div>
                            <div class="project-roleline">※ 结合腾讯晋级答辩方式和周期的调整，应业务部门的诉求从半年计算一次画像优化至使用 Celery 定时任务按天计算用户该周期内的画像评分。</div>
                        </div>
                    </div>
                </div><!--//item-->
                <hr/>

                <div class="item">
                    <div class="project-title">
                        <span class="darken">名称: </span>
                        <div class="detail">
                            <a href="https://github.com/shabbywu/distribution" target="_blank">moby-distribution</a>
                            <span class="timetag">2023</span>
                        </div>
                    </div>
                    <div class="project-description">
                        <span class="darken">描述: </span>
                        <div class="detail">moby-distribution 是一个使用 python 开发的, 用于操作 Docker Image Manifest 和 Blob（Layers、Config 等）的库。这个工具库由我独立开发和维护，使用该库可实现不依赖 Docker Daemon 的镜像创建，推送等操作。目前该库被应用在 Blueking PaaS 项目, 用于合成并上传 S-Mart 应用镜像。</div>
                    </div>
                </div><!--//item-->

                <div class="item">
                    <div class="project-title">
                        <span class="darken">名称: </span>
                        <div class="detail">
                            <a href="https://github.com/shabbywu/Battle-Brothers-CN" target="_blank">Battle-Brothers-CN</a>
                            <span class="timetag">2023-2024</span>
                        </div>
                    </div>
                    <div class="project-description">
                        <span class="darken">描述: </span>
                        <div class="detail">Battle-Brothers-CN 是游戏 <a href="https://store.steampowered.com/app/365360/Battle_Brothers/">Battle Brothers</a> 的中文语言本地化项目。中文语言本地化项目主要分为 4 个模块 - 文本提取、文本翻译、文本替换、内核汉化器。目前该项目的日常运维(持续性的文本更新)完全基于自动化的 CI/CD 工具。</div>
                    </div>
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
                        <h3 class="level-title">Golang</h3>
                        <div class="progress level-bar">
                            <div class="progress-bar theme-progress-bar" role="progressbar" style="width: 75%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>                              
                    </div><!--//item-->

                    <div class="item">
                        <h3 class="level-title">C++</h3>
                        <div class="progress level-bar">
                            <div class="progress-bar theme-progress-bar" role="progressbar" style="width: 65%" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
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
import "./fonts.css"
import "./scss/orbit-1.scss"
import "bootstrap/dist/css/bootstrap.min.css"
import "@fortawesome/fontawesome-free/js/all.js"

onMounted(async () => {
    await import("bootstrap");
})
</script>