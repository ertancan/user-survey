/**
 * Created by ertan on 12/01/15.
*/
var UserSurvey = (function(){
    var container;
    var actions;
    var nextButton;
    var pages;
    var currentPage;
    var startDate;
    var progressBar;
    var finishDelegate;
    var result;
    function _prepare(){
        var progressContainer = $('<div/>',{
            class: 'progress'
        });
        progressBar = $('<div/>',{
            class: 'progress-bar',
            role: 'progressbar',
            'aria-valuemin': "0",
            'aria-valuemax': "100"
        });
        progressBar.css('width', "0%");
        progressBar.appendTo(progressContainer);
        nextButton = $('<button/>',{
            class: 'btn btn-default next-button',
            text: 'Start'
        });
        progressContainer.appendTo(actions);
        nextButton.appendTo(actions);
        nextButton.click(function(){
            result['selection'].push(nextButton.text());
            _handleNext();
        });
    }
    function _start(delegate){
        container.empty();
        currentPage = -1;
        finishDelegate = delegate;
        result = {};
        _handleNext();
    }

    function _handleNext(){
        if(currentPage != -1){
            var exitDict = pages[currentPage];
            var exitListener = exitDict['exit'];
            if(exitListener){
                exitListener();
            }
        }
        container.empty();
        currentPage++;
        var dict = pages[currentPage];
        dict['page'].appendTo(container);
        var listener = dict['event'];
        if(listener){
            listener();
        }
        var nextText = dict['button'];
        if(nextText){
            nextButton.show();
            nextButton.text(nextText);
        }else{
            nextButton.hide();
        }
        progressBar.css('width', ((currentPage/(pages.length-2)) * 100) + "%");
    }
    function _finish(){
        var endDate = new Date();
        result['time'] = (endDate-startDate)/1000;
        result['end'] = endDate.toString();
        finishDelegate(result);
    }
    function _setContainer(containerStr){
        container = $(containerStr);
    }

    function _setActionsContainer(str){
        actions = $(str);
        actions.css('text-align', 'center');
    }
    function _createPage(page, buttonText, eventOnShow, eventOnExit){
        return {page:page, button:buttonText, event:eventOnShow, exit:eventOnExit}
    }
    function _setStartPage(str) {
        var pageContainer = $('<div/>',{
            class: 'survey-page'
        });
        $('<p/>',{
            html: str
        }).appendTo(pageContainer);
        pages = [];
        pages.push(_createPage(pageContainer, 'Next', function(){
            startDate = new Date();
            result['start'] = startDate.toString();
            result['selection'] = [];
        }));
    }
    function _setFinishPage(str, needMail, mailCallback){
        var pageContainer = $('<div/>',{
            class: 'survey-page'
        });
        $('<p/>',{
            text: str
        }).appendTo(pageContainer);
        if(needMail){
            var mailContainer = $('<div/>',{
                class: 'mail-container form-group form-inline'
            }).appendTo(pageContainer);
            var mailInput = $('<input/>',{
                type: 'email',
                class: 'survey-end-email form-control',
                placeholder: 'e-mail address'
            });
            mailInput.appendTo(mailContainer);
            var mailSubmit = $('<button/>',{
                text: 'Submit',
                class: 'btn btn-default'
            });
            mailSubmit.click(function(){
                if(mailCallback)
                    mailCallback(mailInput.val());
                mailInput.hide();
                mailSubmit.hide();
                alert("Thank you! We will send you the results as soon as they are available!")
            });
            mailInput.appendTo(mailContainer);
            mailSubmit.appendTo(mailContainer);
            mailContainer.appendTo(pageContainer);
        }
        pages.push(_createPage(pageContainer, null, function(){
            _finish();
        }));
        console.dir(pages);
    }

    function _addInfoPage(withAge, withGender, withEducation, withCountry){
        if(!withCountry && !withAge && !withGender && !withEducation){
            return;
        }
        var ageInput = null;
        var genderInput = null;
        var educationInput = null;
        var countryInput = null;

        var pageContainer = $('<div/>',{
            class: 'survey-page'
        });
        var formContainer = $('<div/>',{
            class: 'form-horizontal'
        });
        formContainer.appendTo(pageContainer);
        if(withAge){
            var ageGroup = _createFormGroupWithLabel('Age');
            ageInput = $('<input/>',{
                type: 'number',
                id: 'Age-input',
                class: 'form-control'
            });
            var inputContainer = _createContainerWithClass('col-md-3');
            inputContainer.appendTo(ageGroup);
            ageInput.appendTo(inputContainer);
            ageGroup.appendTo(formContainer);
        }
        if(withGender){
            var genderGroup = _createFormGroupWithLabel('Gender');
            genderInput = _createRadioGroupForItems(['Male', 'Female'], 'Gender');
            genderInput.appendTo(genderGroup);
            genderGroup.appendTo(formContainer);
        }
        if(withEducation){
            var educationGroup = _createFormGroupWithLabel('Education');
             educationInput = _createSelectForItems(['High School', 'Bechelor\'s Degree', 'Master\'s Degree', 'Ph.D']);
            var educationContainer = _createContainerWithClass('col-md-3');
            educationInput.appendTo(educationContainer);
            educationContainer.appendTo(educationGroup);
            educationGroup.appendTo(formContainer);
        }
        if(withCountry){
            var countryGroup = _createFormGroupWithLabel('Country');
            var countryContainer = _createContainerWithClass('col-md-3');
            countryInput = $('<select/>',{
                class: 'form-control',
                id: 'countries'
            });
            countryInput.appendTo(countryContainer);
            countryContainer.appendTo(countryGroup);
            countryGroup.appendTo(formContainer);
        }
        pages.push(_createPage(pageContainer, 'Next', function(){
            populateCountries('countries');
        }, function(){
            var info = {};
            if(withAge){
                info['age'] = ageInput.val();
            }
            if(withGender){
                info['gender'] = $('input:radio:checked').val(); // Todo id to get
            }
            if(withCountry){
                info['country'] = countryInput.val();
            }
            if(withEducation){
                info['education'] = educationInput.val();
            }
            result['info'] = info;
        }));
    }

    function _createContainerWithClass(className){
        return $('<div/>',{
            class: className
        });
    }
    function _createFormGroupWithLabel(label){
        var groupContainer = $('<div/>',{
            class: 'form-group'
        });
        var label = $('<label/>',{
            for: label+'-input',
            class: 'control-label col-md-2',
            text: label
        });
        label.appendTo(groupContainer);
        return groupContainer;
    }

    function _createRadioGroupForItems(items, groupName){
        var group = $('<div/>',{
        });
        items.forEach(function(item){
            var radioDiv = $('<div/>',{
                class: 'radio survey-radio-inline'
            });
            var label = $('<label/>',{
                text: item,
                for: item+'-radio',
                class: 'radio-inline survey-radio-label'
            });
            label.appendTo(radioDiv);

            var input = $('<input/>',{
                type: 'radio',
                id: item+'-radio',
                value: item,
                name: groupName
            });
            input.appendTo(radioDiv);

            radioDiv.appendTo(group);
        });
        return group;
    }

    function _createSelectForItems(items){
        var group = $('<select/>',{
            class: 'form-control'
        });
        items.forEach(function(item){
            var item = $('<option/>',{
                text: item
            });
            item.appendTo(group);
        })
        return group;
    }

    function _addComparisonPage(text, left, right){
        var pageContainer = $('<div/>',{
            class: 'survey-page container'
        });
        var textP = $('<p/>',{
            html: text
        });
        textP.appendTo(pageContainer);
        var leftContainer = $('<div/>',{
            class: 'col-md-5 centered-text'
        });
        var divider = $('<div/>',{
            class: 'col-md-2'
        });
        var rightContainer = $('<div/>',{
            class: 'col-md-5 centered-text'
        });

        var selectLeft = $('<button/>',{
            class: 'btn btn-default select-button',
            text: 'Select'
        });
        selectLeft.click(function(){
            result['selection'].push('left');
            _handleNext();
        });

        var selectRight = $('<button/>',{
            class: 'btn btn-default select-button',
            text: 'Select'
        });
        selectRight.click(function(){
            result['selection'].push('right');
            _handleNext();
        });

        leftContainer.appendTo(pageContainer);
        divider.appendTo(pageContainer);
        rightContainer.appendTo(pageContainer);

        left.appendTo(leftContainer);
        selectLeft.appendTo(leftContainer);
        right.appendTo(rightContainer);
        selectRight.appendTo(rightContainer);

        pages.push(_createPage(pageContainer, 'Skip', null));
    }

    function _addRatingPage(image, text, scale){
        var pageContainer = $('<div/>',{
            class: 'survey-page container'
        });
        var imageContainer = $('<div/>',{
            class: 'col-md-6 col-md-offset-3 centered-text'
        });
        image.appendTo(imageContainer);
        imageContainer.appendTo(pageContainer);

        var questionContainer = $('<div/>',{
            class: 'col-md-6 col-md-offset-3 centered-text'
        });

        $('<p/>',{
            html: text
        }).appendTo(questionContainer);

        var labels = [];
        for(var i = 1; i<=scale; i++){
            labels.push(""+i);
        }

        var radios = _createRadioGroupForItems(labels, 'Selection');
        radios.appendTo(questionContainer);
        questionContainer.appendTo(pageContainer);
        pages.push(_createPage(pageContainer, 'Next', null, function(){
            result['selection'].push($('input:radio:checked').val()); // Todo id to get
        }));
    }
    function _createSurveyImage(source){
        var image = $('<img/>',{
            src : source,
            class: 'survey-image'
        });
        return image;
    }

    return {
        prepare: _prepare,
        start: _start,
        addInfoPage: _addInfoPage,
        setContainer: _setContainer,
        setActionsContainer: _setActionsContainer,
        setStartPage: _setStartPage,
        setFinishPage: _setFinishPage,
        addComparisonPage: _addComparisonPage,
        addRatingPage: _addRatingPage,
        createSurveyImage: _createSurveyImage
    };
}());