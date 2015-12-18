"use strict";

/*jslint regexp: true, nomen: true, sloppy: true */
/*global require, define, alert, applicationConfig, location, document, window,  setTimeout, Countable */

define(['jquery', 'slickSlider', 'modal'], function ($) {
    var module = {};

    // Context is passed to modules. If you will pass it, module will bind to
    // exact area in DOM, if not it will bind on every selector

    module.sample = function () {
        // Description: Dummy module, remove this after javascript setup is finished
        console.log('sample');
    };

    module.prototypeValidation = function (context) {
        // Description: Module will bind jquery.validate to each form
        // and will mirror validation unobtrusive behavior.
        // -----------------------------------------------------------------------------------------------
        // http://jqueryvalidation.org/category/methods/
        var validationMessage = $('<span class="field-validation-error"></span>');
        $('form', context).each(function () {
            $(this).validate({
                errorElement: "span",
                errorClass: "input-validation-error",
                errorPlacement: function (error, element) {
                    validationMessage.append(error).insertAfter(element);
                },
                success: function (label) {
                    label.parent().remove();
                }
            });
        });
    };

    module.slickSlider = function(context){
        // Description: Module will bind slick.js slider functionality
        // -----------------------------------------------------------------------------------------------
        // Documentation: http://kenwheeler.github.io/slick/
        // -----------------------------------------------------------------------------------------------
        // Element example:
        //  <div class="js-slick-slider">
        //      <div>your content</div>
        //      <div>your content</div>
        //      <div>your content</div>
        //  </div>

        $('.js-slick-slider', context).slick({
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 3
        });
    };

    module.modal = function (context) {
        // Description: Module will bind modal plugin with it's default configuration
        // -----------------------------------------------------------------------------------------------
        // Documentation: https://github.com/tkirda/modal-box
        // -----------------------------------------------------------------------------------------------
        // Element example:
        //  <a href="/content/styles/site-styles.css" class="modal-demo" title="Modal demo" data-modal="">
        //      View Expense Report
        //  </a>

        $('[data-modal]', context).on('click', function (e) {
            e.preventDefault();
            $(this).openModal();
        });
    };

    module.init = function () {
        module.sample();
        // uncomment these default modules or remove them
        /*
        module.modal();
        module.prototypeValidation();
        */
    };

    return module;
});