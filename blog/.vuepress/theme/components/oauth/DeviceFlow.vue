<template>
<div class="px-3 mt-5 mx-auto"> 
 <div class="Box color-shadow-small">
  <div class="Box-body p-3 p-md-4"> 
   <h2 class="text-center mb-4">Device Activation</h2> 
    <p class="mb-4 text-center"><label for="user_code">Visiting <a :href="verificationUri">{{  verificationUri }}</a> to continue</label></p> 
    <div class="d-flex flex-justify-between flex-items-center mb-4"> 
     <input type="text" name="user-code-0" id="user-code-0" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" aria-label="User code 0" data-next="user-code-1" readonly :value="userCodePart[0]"/>
     <input type="text" name="user-code-1" id="user-code-1" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[1]"/>
     <input type="text" name="user-code-2" id="user-code-2" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[2]"/>
     <input type="text" name="user-code-3" id="user-code-3" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[3]"/>
     <input type="text" name="user-code-4" id="user-code-4" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[4]"/>
     <input type="text" name="user-code-5" id="user-code-5" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[5]"/>
     <input type="text" name="user-code-6" id="user-code-6" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[6]"/>
     <input type="text" name="user-code-7" id="user-code-7" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[7]"/>
     <input type="text" name="user-code-8" id="user-code-8" class="form-control js-user-code-field h1" maxlength="1" style="height: 2em; max-width: 2em; text-transform: uppercase" readonly :value="userCodePart[8]"/>
    </div> 
   <div class="col-sm-12 mt-2"> 
    <p class="text-small color-fg-muted mb-0 text-center"><label for="user_code">Enter the code in your web browser</label></p> 
   </div>
  </div> 
 </div> 
</div>
</template>
<script>
export default {
    name: 'DeviceFlow',
    props: {
        userCode: {
            type: String
        },
        verificationUri: {
            type: String
        }
    },
    data: function () {
        return {
            userCodePart: this.userCode.split('')
        }
    }
}
</script>
<style lang="stylus" scoped>
.px-3 {
    padding-right: var(--base-size-16, 16px) !important;
    padding-left: var(--base-size-16, 16px) !important;
}

.mx-auto {
    margin-right: auto !important;
    margin-left: auto !important;
}

.mt-5 {
    margin-top: var(--base-size-32, 32px) !important;
}

.Box {
    border-color: rgb(44, 62, 80);
    border-radius: 6px;
    border-style: solid;
    border-width: 1px;
}

.Box-body:last-of-type {
    border-bottom-left-radius: var(--borderRadius-medium, 0.375rem);
    border-bottom-right-radius: var(--borderRadius-medium, 0.375rem);
    margin-bottom: calc(var(--borderWidth-thin, max(1px, 0.0625rem))*-1);
}

.Box-body {
    border-bottom: var(--borderWidth-thin, max(1px, 0.0625rem)) solid var(--borderColor-default, var(--color-border-default));
    padding: var(--stack-padding-normal, 1rem);
}

.d-flex {
    display: flex !important;
}

.flex-items-center {
    align-items: center !important;
}

.flex-justify-between {
    justify-content: space-between !important;
}

.form-control, .form-select {
    padding: 5px 12px;
    font-size: 14px;
    line-height: 20px;
    color: var(--fgColor-default, var(--color-fg-default));
    vertical-align: middle;
    background-color: var(--bgColor-default, var(--color-canvas-default));
    background-repeat: no-repeat;
    background-position: right 8px center;
    border: 1px solid var(--control-borderColor-rest, var(--color-border-default));
    border-radius: 6px;
    box-shadow: var(--shadow-inset, var(--color-primer-shadow-inset));
    transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
    transition-property: color,background-color,box-shadow,border-color;
}

.p-md-4 {
    padding: var(--base-size-24, 24px) !important;
}

.p-3 {
    padding: var(--base-size-16, 16px) !important;
}

.color-shadow-small {
    box-shadow: var(--shadow-resting-small, var(--color-shadow-small)) !important;
}

label {
    font-weight: var(--base-text-weight-semibold, 600);
}

.text-center {
    text-align: center !important;
}

.text-small {
    font-size: var(--h6-size, 12px) !important;
}

.mb-4 {
    margin-bottom: var(--base-size-24, 24px) !important;
}

.col-sm-12 {
    width: 100%;
}

.mb-0 {
    margin-bottom: 0 !important;
}

.color-fg-muted {
    color: var(--fgColor-muted, var(--color-fg-muted)) !important;
}

.h1, .h2, .h3, .h4, .h5, .h6 {
    font-weight: var(--base-text-weight-semibold, 600) !important;
}

.h1 {
    font-size: var(--h1-size, 32px) !important;
}

input {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    font: inherit;
    margin: 0;
    overflow: visible;
}

* {
    box-sizing: border-box;
}

</style>