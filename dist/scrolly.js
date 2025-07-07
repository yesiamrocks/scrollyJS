(function(factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function() {
  "use strict";
  (function() {
    var OSName = "Unknown";
    if (window.navigator.userAgent.indexOf("Windows") != -1) OSName = "Windows";
    else if (window.navigator.userAgent.indexOf("Mac") != -1) OSName = "Mac";
    var isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
    var currentElm = "";
    var lastScrollTop = 0;
    var topToBottom = true;
    var animationClassMap = {};
    var animationInStyleMap = {};
    var animationOutStyleMap = {};
    var tagStyleMap = {};
    var characterAnimateInClassMap = {};
    var characterAnimateOutClassMap = {};
    var hiddenCss = "visibility: hidden;";
    var characterCss = "animation-fill-mode: both;";
    var displayCss = " -webkit-animation-fill-mode: both; visibility: visible;";
    var defaultClickCss = " visibility: visible; -webkit-animation-duration: 1s; display:block;-webkit-animation-fill-mode: both; ";
    var settingOptions = {
      selectorClass: "scrolly",
      dataClickElm: "data-scrolly-click",
      dataMouseoverElm: "data-scrolly-mouseover",
      dataMouseoutElm: "data-scrolly-mouseout",
      dataSelectorIn: "data-scrolly-top",
      dataSelectorOut: "data-scrolly-down",
      dataScrollyInDelay: "data-scrolly-top-delay",
      dataScrollyOutDelay: "data-scrolly-down-delay",
      dataScrollyOffsetTop: "data-scrolly-offset-top",
      dataScrollyOffsetBottom: "data-scrolly-offset-bottom",
      dataCharacterAnimate: "data-scrolly-characters",
      dataScrollyIndex: "data-scrolly-index",
      // Scrolly target event settings
      dataScrollyTargetClick: "data-scrolly-target-click",
      dataScrollyTargetMouseOver: "data-scrolly-target-mouseover",
      dataScrollyTargetMouseOut: "data-scrolly-target-mouseout",
      dataScrollySelector: "data-scrolly-selector",
      dataScrollyAnimation: "data-scrolly-animation",
      /****** settingOptins for resize view screen  ******/
      scrollyOffsetTop: 0,
      //Setting Default Offset Top Value
      scrollyOffsetBottom: 0,
      //Setting Default Offset Bottom Value
      /****** settingOptins for resize view screen depend on OS  ******/
      scrollyMacOffsetTop: 0,
      //Setting Offset Top Value for MAC
      scrollyMacOffsetBottom: 0,
      //Setting Offset Bottom Value for MAC
      scrollyWindowsOffsetTop: 0,
      //Setting Offset Top Value for Windows
      scrollyWindowsOffsetBottom: 0,
      //Setting Offset Bottom Value for Windows
      scrollyTabOffsetTop: 0,
      //Setting Offset Top Value for Tab
      scrollyTabOffsetBottom: 0,
      //Setting Offset Bottom Value for Tab
      scrollyMobileOffsetTop: 0,
      //Setting Offset Top Value for Mobile
      scrollyMobileOffsetBottom: 0,
      //Setting Offset Bottom Value for Mobile
      scrollyDisable: false,
      //There are several options that you can use to disable scrolly on certains devices.
      scrollyAnimationCssRemove: false,
      // scrolly animation css remove from html tag if its true
      /****** default screen resulation work across multiple devices  ******/
      scrollyScreen: {
        mobile: {
          minWidth: 0,
          maxWidth: 767
        },
        tab: {
          minWidth: 768,
          maxWidth: 991
        },
        desktop: {
          minWidth: 992,
          maxWidth: 1200
        },
        lgDesktop: {
          minWidth: 1201,
          maxWidth: 1e4
        }
      },
      scrollyStopIt: {
        mobile: false,
        tab: false,
        desktop: false,
        lgDesktop: false
      }
    };
    this.isInView = function(box) {
      var bottom, top, viewBottom, viewTop;
      viewTop = window.pageYOffset;
      viewBottom = viewTop + window.innerHeight;
      top = this.offsetTop(box);
      bottom = top + box.clientHeight;
      var attrDataScrollyOffsetTop = box.getAttribute(settingOptions.dataScrollyOffsetTop);
      if (attrDataScrollyOffsetTop) {
        viewTop += parseInt(attrDataScrollyOffsetTop);
      } else if (parseInt(settingOptions.scrollyOffsetTop)) {
        viewTop += parseInt(settingOptions.scrollyOffsetTop);
      }
      var attrDataScrollyOffsetBottom = box.getAttribute(settingOptions.dataScrollyOffsetBottom);
      if (attrDataScrollyOffsetBottom) {
        viewBottom -= parseInt(attrDataScrollyOffsetBottom);
      } else if (parseInt(settingOptions.scrollyOffsetBottom)) {
        viewBottom -= parseInt(settingOptions.scrollyOffsetBottom);
      }
      return top <= viewBottom && bottom >= viewTop;
    };
    if (isIE) {
      defaultClickCss = "visibility: visible; animation-duration: 1s;";
    }
    this.makeStyle = function(data, direction) {
      var animationCss = "";
      if (data !== null && data !== "") {
        var splitData = data.trim().split(",");
        animationCss = displayCss;
        if (isIE) {
          animationCss += " animation-duration: 1s; ";
        } else {
          animationCss += " -webkit-animation-duration: 1s; ";
        }
        for (var i = 0; i < splitData.length; i++) {
          var splitDataValue = splitData[i].trim();
          var splitDataValueSplit = splitDataValue.split(":");
          if (splitDataValueSplit.length === 2) {
            var cssProperty = "animation-" + splitDataValueSplit[0].trim();
            var cssValue = splitDataValueSplit[1].trim();
          } else {
            var cssProperty = "animation-name";
            var cssValue = splitDataValue;
          }
          if (isIE) {
            animationCss += cssProperty + ":" + cssValue + "; ";
          } else {
            if (cssProperty == "animation-delay") {
              animationCss += hiddenCss;
              if (direction === "topToBottom") {
                currentElm.setAttribute(settingOptions.dataScrollyInDelay, cssValue);
              } else if (direction === "bottomToTop") {
                currentElm.setAttribute(settingOptions.dataScrollyOutDelay, cssValue);
              }
            } else {
              animationCss += " -webkit-" + cssProperty.trim() + ":" + cssValue + "; ";
            }
          }
        }
      }
      return animationCss;
    };
    this.isHidden = function(elm) {
      if (elm.getAttribute("style") !== null && elm.getAttribute("style").trim() == hiddenCss.trim()) {
        return true;
      }
      return false;
    };
    this.animationStart = function() {
      if (settingOptions.scrollyDisable === true) {
        return 0;
      }
      if (sCount) {
        var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScrollTop >= lastScrollTop) {
          topToBottom = true;
        } else {
          topToBottom = false;
        }
        lastScrollTop = currentScrollTop;
        for (var i = 0; i < sCount; i++) {
          var inView = this.isInView(selector[i]);
          if (inView) {
            this.showElement(i);
          } else {
            this.clearStyle(i);
          }
        }
      }
    };
    this.hasClass = function(element, cls) {
      return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
    };
    var selector = {}, sCount = 0;
    var screenWidth = screen.width;
    this.checkScreenForAnimation = function() {
      if (settingOptions.scrollyStopIt.mobile && (screenWidth >= parseInt(settingOptions.scrollyScreen.mobile.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.mobile.maxWidth))) {
        settingOptions.scrollyDisable = true;
        this.resetWindow();
      } else if (settingOptions.scrollyStopIt.tab && (screenWidth >= parseInt(settingOptions.scrollyScreen.tab.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.tab.maxWidth))) {
        settingOptions.scrollyDisable = true;
        this.resetWindow();
      } else if (settingOptions.scrollyStopIt.desktop && (screenWidth >= parseInt(settingOptions.scrollyScreen.desktop.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.desktop.maxWidth))) {
        settingOptions.scrollyDisable = true;
        this.resetWindow();
      } else if (settingOptions.scrollyStopIt.lgDesktop && (screenWidth >= parseInt(settingOptions.scrollyScreen.lgDesktop.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.lgDesktop.maxWidth))) {
        settingOptions.scrollyDisable = true;
        this.resetWindow();
      } else {
        settingOptions.scrollyDisable = false;
      }
    };
    this.initOptions = function(custom, defaults) {
      var key, value;
      for (key in defaults) {
        value = defaults[key];
        if (custom[key] == null) {
          custom[key] = value;
        }
      }
      return custom;
    };
    this.scrolly = function(options) {
      if (options) {
        settingOptions = this.initOptions(options, settingOptions);
      }
      if (settingOptions.scrollyDisable === true) {
        return 0;
      }
      if (settingOptions.scrollyStopIt) {
        this.checkScreenForAnimation();
      }
      if (OSName === "Windows" && parseInt(settingOptions.scrollyWindowsOffsetTop)) {
        settingOptions.scrollyOffsetTop = parseInt(settingOptions.scrollyWindowsOffsetTop);
      }
      if (OSName === "Windows" && parseInt(settingOptions.scrollyWindowsOffsetBottom)) {
        settingOptions.scrollyOffsetBottom = parseInt(settingOptions.scrollyWindowsOffsetBottom);
      }
      if (OSName === "Mac" && parseInt(settingOptions.scrollyMacOffsetTop)) {
        settingOptions.scrollyOffsetTop = parseInt(settingOptions.scrollyMacOffsetTop);
      }
      if (OSName === "Mac" && parseInt(settingOptions.scrollyMacOffsetBottom)) {
        settingOptions.scrollyOffsetBottom = parseInt(settingOptions.scrollyMacOffsetBottom);
      }
      if (parseInt(settingOptions.scrollyMobileOffsetTop) && (screenWidth >= parseInt(settingOptions.scrollyScreen.mobile.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.mobile.maxWidth))) {
        settingOptions.scrollyOffsetTop = parseInt(settingOptions.scrollyMobileOffsetTop);
      } else if (parseInt(settingOptions.scrollyTabOffsetTop) && (screenWidth >= parseInt(settingOptions.scrollyScreen.tab.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.tab.maxWidth))) {
        settingOptions.scrollyOffsetTop = parseInt(settingOptions.scrollyTabOffsetTop);
      }
      if (parseInt(settingOptions.scrollyMobileOffsetBottom) && (screenWidth >= parseInt(settingOptions.scrollyScreen.mobile.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.mobile.maxWidth))) {
        settingOptions.scrollyOffsetBottom = parseInt(settingOptions.scrollyMobileOffsetBottom);
      } else if (parseInt(settingOptions.scrollyTabOffsetBottom) && (screenWidth >= parseInt(settingOptions.scrollyScreen.tab.minWidth) && screenWidth <= parseInt(settingOptions.scrollyScreen.tab.maxWidth))) {
        settingOptions.scrollyOffsetBottom = parseInt(settingOptions.scrollyTabOffsetBottom);
      }
      var dataInElm = document.querySelectorAll("[" + settingOptions.dataSelectorIn + "]");
      var dataInElmCount = dataInElm.length;
      var dataOutElm = document.querySelectorAll("[" + settingOptions.dataSelectorOut + "]");
      var dataOutElmCount = dataOutElm.length;
      var dataScrollyTargetClickElm = document.querySelectorAll("[" + settingOptions.dataScrollyTargetClick + "]");
      var dataScrollyTargetElmCount = dataScrollyTargetClickElm.length;
      if (dataScrollyTargetElmCount) {
        for (var dataScrollyTargetElmIndex = 0; dataScrollyTargetElmIndex < dataScrollyTargetElmCount; dataScrollyTargetElmIndex++) {
          dataScrollyTargetClickElm[dataScrollyTargetElmIndex].addEventListener("click", scrollyAnimationTarget, true);
          if (!this.hasClass(dataScrollyTargetClickElm[dataScrollyTargetElmIndex], settingOptions.selectorClass)) {
            dataScrollyTargetClickElm[dataScrollyTargetElmIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      var dataScrollyTargetMouseOverElm = document.querySelectorAll("[" + settingOptions.dataScrollyTargetMouseOver + "]");
      var dataScrollyTargetMouseOverElmCount = dataScrollyTargetMouseOverElm.length;
      if (dataScrollyTargetMouseOverElmCount) {
        for (var dataScrollyTargetMouseOverElmIndex = 0; dataScrollyTargetMouseOverElmIndex < dataScrollyTargetMouseOverElmCount; dataScrollyTargetMouseOverElmIndex++) {
          dataScrollyTargetMouseOverElm[dataScrollyTargetMouseOverElmIndex].addEventListener("mouseover", scrollyAnimationTarget, true);
          if (!this.hasClass(dataScrollyTargetMouseOverElm[dataScrollyTargetMouseOverElmIndex], settingOptions.selectorClass)) {
            dataScrollyTargetMouseOverElm[dataScrollyTargetMouseOverElmIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      var dataScrollyTargetMouseOutElm = document.querySelectorAll("[" + settingOptions.dataScrollyTargetMouseOut + "]");
      var dataScrollyTargetMouseOutElmCount = dataScrollyTargetMouseOutElm.length;
      if (dataScrollyTargetMouseOutElmCount) {
        for (var dataScrollyTargetElmIndex = 0; dataScrollyTargetElmIndex < dataScrollyTargetMouseOutElmCount; dataScrollyTargetElmIndex++) {
          dataScrollyTargetMouseOutElm[dataScrollyTargetElmIndex].addEventListener("mouseout", scrollyAnimationTarget, true);
          if (!this.hasClass(dataScrollyTargetMouseOutElm[dataScrollyTargetElmIndex], settingOptions.selectorClass)) {
            dataScrollyTargetMouseOutElm[dataScrollyTargetElmIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      var clickElm = document.querySelectorAll("[" + settingOptions.dataClickElm + "]");
      var clickElmCount = clickElm.length;
      if (clickElmCount) {
        for (var clickElmIndex = 0; clickElmIndex < clickElmCount; clickElmIndex++) {
          clickElm[clickElmIndex].addEventListener("click", this.cssAnimationClick);
          if (!this.hasClass(clickElm[clickElmIndex], settingOptions.selectorClass)) {
            clickElm[clickElmIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      var mouseOverElm = document.querySelectorAll("[" + settingOptions.dataMouseoverElm + "]");
      var mouseOverElmCount = mouseOverElm.length;
      if (mouseOverElmCount) {
        for (var mouseOverElmIndex = 0; mouseOverElmIndex < mouseOverElmCount; mouseOverElmIndex++) {
          mouseOverElm[mouseOverElmIndex].addEventListener("mouseover", this.cssAnimationMouseOver);
          if (!this.hasClass(mouseOverElm[mouseOverElmIndex], settingOptions.selectorClass)) {
            mouseOverElm[mouseOverElmIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      var mouseOutElm = document.querySelectorAll("[" + settingOptions.dataMouseoutElm + "]");
      var mouseOutElmCount = mouseOutElm.length;
      if (mouseOutElmCount) {
        for (var mouseOutElmCountIndex = 0; mouseOutElmCountIndex < mouseOutElmCount; mouseOutElmCountIndex++) {
          mouseOutElm[mouseOutElmCountIndex].addEventListener("mouseout", this.cssAnimationMouseOut);
          if (!this.hasClass(mouseOutElm[mouseOutElmCountIndex], settingOptions.selectorClass)) {
            mouseOutElm[mouseOutElmCountIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      if (dataInElmCount) {
        for (var dataInElmCountIndex = 0; dataInElmCountIndex < dataInElmCount; dataInElmCountIndex++) {
          if (!this.hasClass(dataInElm[dataInElmCountIndex], settingOptions.selectorClass)) {
            dataInElm[dataInElmCountIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      if (dataOutElmCount) {
        for (var dataOutElmCountIndex = 0; dataOutElmCountIndex < dataOutElmCount; dataOutElmCountIndex++) {
          if (!this.hasClass(dataOutElm[dataOutElmCountIndex], settingOptions.selectorClass)) {
            dataOutElm[dataOutElmCountIndex].className += " " + settingOptions.selectorClass;
          }
        }
      }
      selector = document.querySelectorAll("." + settingOptions.selectorClass);
      sCount = selector.length;
      if (sCount) {
        for (var i = 0; i < sCount; i++) {
          selector[i];
          currentElm = selector[i];
          animationClassMap[i] = "";
          animationInStyleMap[i] = "";
          animationOutStyleMap[i] = "";
          tagStyleMap[i] = "";
          characterAnimateInClassMap[i] = "";
          characterAnimateOutClassMap[i] = "";
          if (settingOptions.scrollyAnimationCssRemove) {
            selector[i].setAttribute(settingOptions.dataScrollyIndex, i);
            var thisElm = selector[i];
            thisElm.addEventListener("webkitAnimationEnd", cssAnimtionEnd, false);
            thisElm.addEventListener("animationend", cssAnimtionEnd, false);
            thisElm.addEventListener("oanimationend", cssAnimtionEnd, false);
          }
          var getInlineStyle = selector[i].getAttribute("style");
          if (getInlineStyle) {
            tagStyleMap[i] = getInlineStyle;
          }
          var attrClass = selector[i].getAttribute("class");
          if (attrClass) {
            animationClassMap[i] = attrClass;
          }
          var attrDataCharacterAnimate = selector[i].getAttribute(settingOptions.dataCharacterAnimate);
          if (attrDataCharacterAnimate) {
            var innerText = selector[i].textContent.trim();
            var attr_value = attrDataCharacterAnimate.trim().replace(/\s/g, "");
            var behaves = attr_value.split(",");
            var delay = 150;
            var randomly = false;
            var charecterAttrInData = selector[i].getAttribute(settingOptions.dataSelectorIn);
            var charecterAttrOutData = selector[i].getAttribute(settingOptions.dataSelectorOut);
            if (charecterAttrInData) {
              characterAnimateInClassMap[i] = " " + charecterAttrInData + " ";
            }
            if (charecterAttrOutData) {
              characterAnimateOutClassMap[i] = " " + charecterAttrOutData + " ";
            }
            for (var bl = 0; bl < behaves.length; bl++) {
              var splitDataValue = behaves[bl].trim();
              var behave = splitDataValue.split(":");
              if (behave[0] == "delay") {
                delay = behave[1];
              } else if (behave[0] == "randomly") {
                randomly = true;
              }
            }
            var seq = [];
            for (var al = 0; al < innerText.length; al++) {
              seq[al] = al;
            }
            if (randomly) {
              seq = this.shuffle(seq);
            }
            var index = 0;
            var new_str = "";
            for (var j = 0; j < innerText.length; j++) {
              var str = innerText[j];
              if (str != " ") {
                var ad = delay * seq[index];
                index++;
                var styleCss = " display: inline-block; animation-fill-mode: both; -webkit-animation-duration:1s; -webkit-animation-delay:" + ad + "ms; ";
                str = '<span style="' + styleCss + '" >' + str + "</span>";
              }
              new_str += str;
            }
            selector[i].innerHTML = new_str;
          } else {
            var attrInData = selector[i].getAttribute(settingOptions.dataSelectorIn);
            if (attrInData) {
              animationInStyleMap[i] = this.makeStyle(attrInData, "topToBottom");
              selector[i].removeAttribute(settingOptions.dataSelectorIn);
            }
            var attrOutData = selector[i].getAttribute(settingOptions.dataSelectorOut);
            if (attrOutData) {
              animationOutStyleMap[i] = this.makeStyle(attrOutData, "bottomToTop");
              selector[i].removeAttribute(settingOptions.dataSelectorOut);
            }
          }
          this.clearStyle(i);
        }
        animationStart();
      }
      window.onscroll = function() {
        animationStart();
      };
      window.addEventListener("resize", function() {
        this.checkScreenForAnimation();
      });
    };
    this.shuffle = function(array) {
      var i = array.length, j = 0, temp;
      while (i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    };
    var dataScrollyInDelayTimer = false;
    var dataScrollyOutDelayTimer = false;
    this.showElement = function(elmIndex) {
      if (this.isHidden(selector[elmIndex])) {
        var isCharacterAnimate = selector[elmIndex].getAttribute(settingOptions.dataCharacterAnimate);
        if (topToBottom) {
          if (selector[elmIndex].getAttribute(settingOptions.dataScrollyOutDelay)) {
            var timeInTime = parseFloat(selector[elmIndex].getAttribute(settingOptions.dataScrollyOutDelay)) * 1e3;
            if (dataScrollyOutDelayTimer) {
              clearTimeout(dataScrollyOutDelayTimer);
              dataScrollyOutDelayTimer = false;
            }
            dataScrollyInDelayTimer = setTimeout(function() {
              if (isCharacterAnimate) {
                selector[elmIndex].style.cssText = displayCss + tagStyleMap[elmIndex] + characterCss;
                if (!this.hasClass(selector[elmIndex], characterAnimateInClassMap[elmIndex])) {
                  selector[elmIndex].className += characterAnimateInClassMap[elmIndex];
                }
              } else {
                selector[elmIndex].style.cssText = animationOutStyleMap[elmIndex] + tagStyleMap[elmIndex];
              }
              selector[elmIndex].style.visibility = "visible";
            }, timeInTime);
          } else {
            if (isCharacterAnimate) {
              selector[elmIndex].style.cssText = displayCss + tagStyleMap[elmIndex] + characterCss;
              if (!this.hasClass(selector[elmIndex], characterAnimateInClassMap[elmIndex])) {
                selector[elmIndex].className += characterAnimateInClassMap[elmIndex];
              }
            } else {
              selector[elmIndex].style.cssText = displayCss + animationOutStyleMap[elmIndex] + tagStyleMap[elmIndex];
            }
            selector[elmIndex].style.visibility = "visible";
          }
        } else {
          if (selector[elmIndex].getAttribute(settingOptions.dataScrollyInDelay)) {
            var timeOutTime = parseFloat(selector[elmIndex].getAttribute(settingOptions.dataScrollyInDelay)) * 1e3;
            if (dataScrollyInDelayTimer) {
              clearTimeout(dataScrollyInDelayTimer);
              dataScrollyInDelayTimer = false;
            }
            dataScrollyOutDelayTimer = setTimeout(function() {
              if (isCharacterAnimate) {
                selector[elmIndex].style.cssText = displayCss + tagStyleMap[elmIndex] + characterCss;
                if (!this.hasClass(selector[elmIndex], characterAnimateOutClassMap[elmIndex])) {
                  selector[elmIndex].className += characterAnimateOutClassMap[elmIndex];
                }
              } else {
                selector[elmIndex].style.cssText = animationInStyleMap[elmIndex] + tagStyleMap[elmIndex];
              }
              selector[elmIndex].style.visibility = "visible";
            }, timeOutTime);
          } else {
            if (isCharacterAnimate) {
              selector[elmIndex].style.cssText = displayCss + tagStyleMap[elmIndex] + characterCss;
              if (!this.hasClass(selector[elmIndex], characterAnimateOutClassMap[elmIndex])) {
                selector[elmIndex].className += characterAnimateOutClassMap[elmIndex];
              }
            } else {
              selector[elmIndex].style.cssText = displayCss + animationInStyleMap[elmIndex] + tagStyleMap[elmIndex];
            }
            selector[elmIndex].style.visibility = "visible";
          }
        }
      }
    };
    this.resetWindow = function() {
      if (sCount) {
        for (var i = 0; i < sCount; i++) {
          selector[i].style.cssText = tagStyleMap[i];
        }
      }
    };
    this.clearStyle = function(elmIndex) {
      var isCharacterAnimate = selector[elmIndex].getAttribute(settingOptions.dataCharacterAnimate);
      selector[elmIndex].style.cssText = hiddenCss;
      if (isCharacterAnimate) {
        selector[elmIndex].className = "scrolly " + animationClassMap[elmIndex];
      }
    };
    this.getScroll = function() {
      if (window.pageYOffset != void 0) {
        return pageYOffset;
      } else {
        var sy, d = document, r = d.documentElement, b = d.body;
        r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return sy;
      }
    };
    this.offsetTop = function(element) {
      var top;
      while (element.offsetTop === void 0) {
        element = element.parentNode;
      }
      top = element.offsetTop;
      while (element = element.offsetParent) {
        top += element.offsetTop;
      }
      return top;
    };
    var scrollyAnimationTarget = function() {
      var clickTag = this;
      var clickTagTarget = clickTag.getAttribute(settingOptions.dataScrollyTargetClick);
      if (clickTagTarget == null) {
        clickTagTarget = clickTag.getAttribute(settingOptions.dataScrollyTargetMouseOver);
      }
      if (clickTagTarget == null) {
        clickTagTarget = clickTag.getAttribute(settingOptions.dataScrollyTargetMouseOut);
      }
      var dataScrollyTargetElm = document.querySelector("[" + settingOptions.dataScrollySelector + "=" + clickTagTarget + "]");
      var thisElm = dataScrollyTargetElm;
      var clickEvnCssName = clickTag.getAttribute(settingOptions.dataScrollyAnimation);
      var thisAttrStyle = thisElm.getAttribute("style");
      thisElm.removeAttribute("style");
      if (!thisAttrStyle) {
        thisAttrStyle = "";
      }
      if (thisElm.getAttribute(settingOptions.dataScrollyIndex) === null) {
        var tagStyleMapSizeIndex = parseInt(Object.size(tagStyleMap)) + 1;
        thisElm.setAttribute(settingOptions.dataScrollyIndex, tagStyleMapSizeIndex);
        tagStyleMap[tagStyleMapSizeIndex] = thisAttrStyle;
        thisElm.addEventListener("webkitAnimationEnd", cssAnimtionEnd, false);
        thisElm.addEventListener("animationend", cssAnimtionEnd, false);
        thisElm.addEventListener("oanimationend", cssAnimtionEnd, false);
      }
      setTimeout(function() {
        thisElm.style.cssText = thisAttrStyle + defaultClickCss + " animation-name: " + clickEvnCssName + ";";
      }, 0);
    };
    Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
      }
      return size;
    };
    this.cssAnimtionEnd = function() {
      var thisTag = this;
      var thisIndex = parseInt(thisTag.getAttribute(settingOptions.dataScrollyIndex));
      thisTag.removeAttribute("style");
      if (thisIndex && tagStyleMap[thisIndex] !== "") {
        thisTag.style.cssText = tagStyleMap[thisIndex];
      }
    };
    this.cssAnimationClick = function() {
      var clickTag = this;
      var clickEvnCssName = clickTag.getAttribute(settingOptions.dataClickElm).trim();
      clickTag.removeAttribute("style");
      setTimeout(function() {
        clickTag.style.cssText = defaultClickCss + " animation-name: " + clickEvnCssName + ";";
      }, 0);
    };
    this.cssAnimationMouseOver = function() {
      var clickTag = this;
      var clickEvnCssName = clickTag.getAttribute(settingOptions.dataMouseoverElm).trim();
      clickTag.removeAttribute("style");
      setTimeout(function() {
        clickTag.style.cssText = defaultClickCss + " animation-name: " + clickEvnCssName + ";";
      }, 0);
    };
    this.cssAnimationMouseOut = function() {
      var clickTag = this;
      var clickEvnCssName = clickTag.getAttribute(settingOptions.dataMouseoutElm).trim();
      clickTag.removeAttribute("style");
      setTimeout(function() {
        clickTag.style.cssText = defaultClickCss + " animation-name: " + clickEvnCssName + ";";
      }, 0);
    };
  })();
});
//# sourceMappingURL=scrolly.js.map
