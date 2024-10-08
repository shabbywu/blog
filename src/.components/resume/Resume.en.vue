<template>
    <div class="wrapper">
        <div class="sidebar-wrapper">
            <div class="profile-container">

                <h1 class="name">Jingtao Wu</h1>
                <h3 class="tagline">Full Stack Developer</h3>
            </div><!--//profile-container-->
            
            <div class="contact-container container-block">
                <ul class="list-unstyled contact-list">
                    <li class="email"><i class="fa-solid fa-envelope"></i><a href="mailto: shabbywu@qq.com">shabbywu@qq.com</a></li>
                    <li class="phone"><i class="fa-solid fa-phone"></i><a href="tel:+86 18620447891">+86 18620447891</a></li>
                    <li class="website"><i class="fa-solid fa-globe"></i><a href="https://blog.shabbywu.cn/" target="_blank">blog.shabbywu.cn</a></li>
                    <li class="linkedin"><i class="fa-brands fa-linkedin-in"></i><a href="https://www.linkedin.com/in/%E9%95%9C%E6%BB%94-%E4%BC%8D-581158260/" target="_blank">linkedin</a></li>
                    <li class="github"><i class="fa-brands fa-github"></i><a href="#" target="_blank">github.com/shabbywu</a></li>
                    <!-- <li class="twitter"><i class="fa-brands fa-twitter"></i><a href="https://twitter.com/3rdwave_themes" target="_blank">@twittername</a></li> -->
                </ul>
            </div><!--//contact-container-->
            <div class="education-container container-block">
                <h2 class="container-block-title">Education</h2>
                <div class="item">
                    <h4 class="degree">Bachelor</h4>
                    <h5 class="meta">South China University of Technology</h5>
                        <div class="time">2015 - 2019</div>
                </div><!--//item-->
            </div><!--//education-container-->
            
            <div class="languages-container container-block">
                <h2 class="container-block-title">Languages</h2>
                <ul class="list-unstyled interests-list">
                    <li>Chinese <span class="lang-desc">(Native)</span></li>
                    <li>Cantonese <span class="lang-desc">(Native)</span></li>
                    <li>English <span class="lang-desc">(Good working knowledge)</span></li>
                </ul>
            </div><!--//interests-->
            
            <div class="interests-container container-block">
                <h2 class="container-block-title">Interests</h2>
                <ul class="list-unstyled interests-list">
                    <li>Electronic Game</li>
                    <li>Photography</li>
                </ul>
            </div><!--//interests-->
            
        </div><!--//sidebar-wrapper-->
        
        <div class="main-wrapper">
            
            <section class="section summary-section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-user"></i></span>Career Profile</h2>
                <div class="summary">
                    <p style="margin-bottom: 0px;">
                        Software engineer with 5 years of experience in full-stack development, proficient in Python and Container Technology, familiar with Golang and C++ development, and has rich experience in JavaScript, Vue and CI/CD. While working at Tencent, I am mainly involved in the development and maintenance of an Application PaaS(Blueking PaaS), which is one of the cornerstones of Tencent game operation system.
                    </p>
                </div><!--//summary-->
            </section><!--//section-->
            
            <section class="section experiences-section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-briefcase"></i></span>Experiences</h2>
                
                <div class="item">
                    <div class="meta">
                        <div class="upper-row">
                            <h3 class="job-title">Senior Software Engineer</h3>
                            <div class="time">2019 - 2024</div>
                        </div><!--//upper-row-->
                        <div class="company">Tencent, Shenzhen, China</div>
                    </div><!--//meta-->
                    <div class="details">

                    </div><!--//details-->
                </div><!--//item-->
            </section><!--//section-->
            
            <section class="section projects-section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-archive"></i></span>Projects</h2>
                <div class="item">
                    <span class="project-title"><a href="https://github.com/TencentBlueKing/blueking-paas" target="_blank">Blueking PaaS</a></span> - <span class="project-tagline">The BlueKing PaaS is an application development platform which with 1600+ SaaS applications hosted and running within Tencent.</span>
                </div><!--//item-->

                <div class="item">
                    <span class="project-title"><a href="javascript:void(0);">Career Homepage</a></span> - <span class="project-tagline">Career Homepage is a staff profiling system within Tencent IEG's Technical Operations Department. The system is based on the Blueking Operations and Maintenance Basic Data Platform(bk-data), and uses a configurable indicators calculation system to quantify staff capabilities in four dimensions: mass automation, operations and maintenance development, DevOps, and AIOps.</span>
                </div><!--//item-->

                <div class="item">
                    <span class="project-title"><a href="javascript:void(0);">PaaS-Analysis</a></span> - <span class="project-tagline">paas-analysis is a lightweight PV statistics project, developed in Fastapi, Redis and Lua in OpenResty.</span>
                </div><!--//item-->

                <hr/>

                <div class="item">
                    <span class="project-title"><a href="https://github.com/shabbywu/distribution" target="_blank">moby-distribution</a></span> - <span class="project-tagline">moby-distribution is a library for operating Docker Image Manifest and Blobs (Layers, Config, etc.).</span>
                </div><!--//item-->
                <div class="item">
                    <span class="project-title"><a href="https://github.com/shabbywu/Battle-Brothers-CN" target="_blank">Battle-Brothers-CN</a></span> - <span class="project-tagline">Battle-Brothers-CN is a localization project for game <a href="https://store.steampowered.com/app/365360/Battle_Brothers/">Battle Brothers</a>. This project is full maintained by automation CI/CD tools.</span>
                </div><!--//item-->
            </section><!--//section-->
            
            <section class="skills-section section">
                <h2 class="section-title"><span class="icon-holder"><i class="fa-solid fa-rocket"></i></span>Skills &amp; Proficiency</h2>
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