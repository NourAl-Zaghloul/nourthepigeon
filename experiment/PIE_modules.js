Tree.Utilities.containerHandler = function(Loc, stage = "create"){
    switch(stage){
        case "create":
        case 0:
            Tree.DOM[Loc] = document.createElement("div");
            Tree.DOM[Loc].id = Loc;
            Tree.DOM[Loc].className = "fullsize";
            Tree.Utilities.cssUpdate(Tree.DOM[Loc], Data.Tree[Loc].styleContainer);
            break;
        case "activate":
        case 1:
            Tree.DOM.main.appendChild(Tree.DOM[Loc]);
            Tree.Utilities.cssUpdate(Tree.DOM[Loc], Data.Tree[Loc].styleContainer);
            break;
        case "deactivate":
        case 2:
            Tree.DOM[Loc].style.display = "none";
            Tree.DOM.main.removeChild(Tree.DOM[Loc]);
            break;
        case "destroy":
        case 3:
            Tree.DOM[Loc].remove();

            // Delete all DOM related to this Loc's Container
            for(let count = 0; count < Data.Tree[Loc].DOMs.length; count++){
                delete Tree.DOM[Data.Tree[Loc].DOMs[count]];
            }
            break;   
    }
}

Tree.Utilities.cssUpdate = function(element, argJSON = {}){
    if(argJSON != undefined){
        for(let [key, value] of Object.entries(argJSON)){
            element.style[key] = value;
        }
    } else {
        console.warn(`cssUpdate was called on ${element.id} but no arguments were provided`)
    }
}

Tree.Utilities.elementCreator = function(Loc, argJSON){
    if(typeof argJSON == 'object'){
        let id = argJSON.id ? `${Loc}_${argJSON.id}` : `${Loc}_${Tree.Utilities.uuid()}`;

        let tagName = argJSON.tagName || "div";
        Tree.DOM[id] = document.createElement(tagName);
        Tree.DOM[id].id = id;

        if(Data.Tree[Loc].DOMs != undefined){
            Data.Tree[Loc].DOMs.push(id);
        } else {
            Data.Tree[Loc].DOMs = [id]
        }

        Tree.Utilities.cssUpdate(Tree.DOM[id], argJSON.style)

        for(let [key, value] of Object.entries(argJSON)){
            switch(key){
                default:
                    Tree.DOM[id][key] = value;
                    break;
                case "style":
                case "tagName":
                case "id":
                case "parentElement":
                    break;
                // TODO: appending to DOM
            }
        }

        switch(argJSON.parentElement){
            case undefined:
            case 'Loc':
                Tree.DOM[Loc].appendChild(Tree.DOM[id]);
                break;
            case null:
                break;
            case 'main':
                Tree.DOM.main.appendChild(Tree.DOM[id]);
                break;
            default:
                Tree.DOM[`${Loc}_${argJSON.parentElement}`].appendChild(Tree.DOM[id]);
                break;
        }
    } else {
        console.warn(`Tried to create element at ${Loc}, but was not given any arguments`)
    }
}

Tree.Templates.Instruction = {
    Template: "Instruction",
    styleDiv: "display: grid; place-items: center; grid-template-columns: 1fr; grid-template-rows: 3fr 1fr; background-color: white;",
    styleTextDiv: "display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 24pt; padding: 5%; overflow-y: clip;",
    styleButtonDiv: "display: flex; align-items: center; justify-content: center; width: 80vw;",
    styleNextButton: "height: 80%; width: 30%; background-color: grey10; font-size: 18pt;",
    NextButtonText: "Next",
    Loop: 0,
    Text: ["Add text to instructions using the 'Text' parameter on the template"],
    EventListeners: [
        {type: "create",
         on: "__SELF__",
         active: true,
         systems: ["create_Instruction"]}, 
        {type: "activate",
         on: "__SELF__",
         active: true,
         systems: ["activate_Instruction"]
        }, 
        {type: "deactivate",
         on: "__SELF__",
         active: false,
         systems: ["deactivate_Instruction"]
        }, 
        {type: "destroy",
         on: "__SELF__",
         active: true,
         systems: ["destroy_Instruction"]
        },
        {type: "click",
         on: "__SELF__",
         active: false,
         systems: ["click_Instruction"]
        }
    ]
}

Tree.Systems.create_Instruction = function(Loc){ 
    Tree.DOM[Loc] = document.createElement("div");
    Tree.DOM[Loc].id = Loc;
    Tree.DOM[Loc].className = "fullsize";
    Tree.DOM[Loc].style.cssText = Data.Tree[Loc].styleDiv;

    // Create Text Div
    Tree.DOM[`${Loc}_TextDiv`] = document.createElement("div");
    Tree.DOM[`${Loc}_TextDiv`].id = `${Loc}_TextDiv`;
    Tree.DOM[`${Loc}_TextDiv`].style.cssText = Data.Tree[Loc].styleTextDiv;
    Tree.DOM[`${Loc}_TextDiv`].innerHTML = Data.Tree[Loc].Text[0];
    Tree.DOM[`${Loc}_TextDiv`].tabIndex = 0;

    // Create Button Div
    Tree.DOM[`${Loc}_ButtonDiv`] = document.createElement("div");
    Tree.DOM[`${Loc}_ButtonDiv`].id = `${Loc}_ButtonDiv`;
    Tree.DOM[`${Loc}_ButtonDiv`].style.cssText = Data.Tree[Loc].styleButtonDiv;
    
    // Create the Next button
    Tree.DOM[`${Loc}_nextButton`] = document.createElement("button");
    Tree.DOM[`${Loc}_nextButton`].id = `${Loc}_nextButton`;
    Tree.DOM[`${Loc}_nextButton`].style.cssText = Data.Tree[Loc].styleNextButton;
    
    // attach things to the DOM
    Tree.DOM[Loc].appendChild(Tree.DOM[`${Loc}_TextDiv`]);
    Tree.DOM[Loc].appendChild(Tree.DOM[`${Loc}_ButtonDiv`]);
    Tree.DOM[`${Loc}_ButtonDiv`].appendChild(Tree.DOM[`${Loc}_nextButton`]);

    if(Data.Tree[Loc].NextButtonText != false){
        // Create Next Button Text
        Tree.DOM[`${Loc}_nextButtonText`] = document.createElement("p");
        Tree.DOM[`${Loc}_nextButtonText`].id = `${Loc}_nextButtonText`;
        Tree.DOM[`${Loc}_nextButtonText`].innerText = Data.Tree[Loc].NextButtonText || "Next";

        Tree.DOM[`${Loc}_nextButton`].appendChild(Tree.DOM[`${Loc}_nextButtonText`])
    }

    // create eventEmitters (js-default) for clicks on the button
    Tree.DOM[`${Loc}_nextButton`].onclick = function(){Tree.Utilities.eventEmit("click", Loc)}

    // create DOM list
    Data.Tree[Loc].DOMs = [Loc, `${Loc}_nextButton`]

    // activate/deactivate Event Listeners
    Tree.Utilities.eventlistenerRemove("create", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
}
Tree.Systems.activate_Instruction = function(Loc){
    Tree.DOM.main.appendChild(Tree.DOM[Loc]);
    Tree.DOM[Loc].style.display = "grid";

    // Set baseline for timing
    Data.Tree[Loc].LoopStart = Data.Time.PN_current;

    // focus text element
    Tree.DOM[`${Loc}_TextDiv`].focus()

    // (de)activate eventListeners
    Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);
    Tree.Utilities.eventlistenerActivate(`click`, Loc, Loc);
}
Tree.Systems.deactivate_Instruction = function(Loc){
    Tree.DOM[Loc].style.display = "none";
    Data.Tree[Loc].Loop++;
    Tree.DOM.main.removeChild(Tree.DOM[Loc]);

    // (de)activate eventListeners
    Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
    Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerDeactivate(`click`, Loc, Loc);

    // emit child deactivated event for parent
    Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});

    Tree.Utilities.eventEmit("destroy", Loc);
}
Tree.Systems.destroy_Instruction = function(Loc){
    // Get rid of DOM elements
    Tree.DOM[Loc].remove();

    // Delete all DOM related to this Loc
    for(let count = 0; count < Data.Tree[Loc].DOMs.length; count++){
        delete Tree.DOM[Data.Tree[Loc].DOMs[count]];
    }

    // remove eventListeners
    Tree.Utilities.eventlistenerRemove("activate", Loc, Loc);
    Tree.Utilities.eventlistenerRemove("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerRemove(`destroy`, Loc, Loc);
    Tree.Utilities.eventlistenerRemove(`click`, Loc, Loc);

    // emit childDestroyed event to parent
    Tree.Utilities.eventEmit("childDestroyed", Data.Tree[Loc].parentLoc, {Child: Loc})

    // delete self
    delete Data.Tree[Loc]
}
Tree.Systems.click_Instruction = function(Loc){
    console.log(Loc);
    //Tree.Utilities.eventEmit("deactivate", Loc, Loc);
    Data.Tree[Loc].Loop++;

    if(Data.Tree[Loc].Loop >= Data.Tree[Loc].Text.length){
        Tree.Utilities.eventEmit("deactivate", Loc);
    } else {
        Tree.DOM[`${Loc}_TextDiv`].innerHTML = Data.Tree[Loc].Text[Data.Tree[Loc].Loop];
        Tree.DOM[`${Loc}_TextDiv`].focus()
    }
}


Tree.Templates.XAFCwithText = {
    Template: "XAFCwithText",
    styleContainer: {
        position: 'absolute',
        display: ''
    },
    textDiv: {
        tagName: "div",
        id: "textDiv",
        style: {
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            fontSize: "36pt",
            padding: "5%",
            overflowY: "clip",
            height: "36%",
            width: "90%",
            textAlign: "center"
        }
    },
    textDOM: {
        tagName: "p",
        id: "textDOM",
        parentElement: 'textDiv',
        style: {}
    },
    stimuliDiv: {
        tagName: "div",
        id: "stimuliDiv",
        style: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            height: "33%",
            width: "100%"
        }
    },
    stimuliButtons: {
        tagName: "button",
        id: "stimuliButton_",
        parentElement: 'stimuliDiv',
        style: {
            backgroundColor: "transparent",
            padding: 0,
            width: '360px',
            height: '360px',
            border: '4px black solid'
        }
    },
    stimuliDOMs: { 
        tagName: "img",
        id: "stimuliDOM_",
        parentElement: 'stimuliButton_',
        loading: "eager",
        style: {
            height: 360,
            width: 360
        }
    },
    canvasDOM: { //! HACK
        tagName: 'canvas',
        id: 'canvasDOM',
        parentElement: 'main',
        width: 1200,
        height: 800,
        style: {
            position: 'absolute',
            zIndex: -12,
            top: 0,
            left: 0,
            width: 1200,
            height: 800
        }
    },
    Loop: 0,
    trials: [],
    EventListeners: [
        {type: "create",
         on: "__SELF__",
         active: true,
         systems: ["create_XAFCwithText"]}, 
        {type: "activate",
         on: "__SELF__",
         active: true,
         systems: ["activate_XAFCwithText"]
        }, 
        {type: "deactivate",
         on: "__SELF__",
         active: false,
         systems: ["deactivate_XAFCwithText"]
        }, 
        {type: "destroy",
         on: "__SELF__",
         active: true,
         systems: ["destroy_XAFCwithText"]
        },
        {type: "click",
         on: "__SELF__",
         active: false,
         systems: ["click_XAFCwithText"]
        }
    ]
}

Tree.Systems.create_XAFCwithText = function(Loc){
    // creating DOM elements
    Tree.Utilities.containerHandler(Loc, "create");

    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].canvasDOM); //! HACK
    Data.Tree[Loc].Images = []; //! HACK

    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].textDiv);
    
    Data.Tree[Loc].textDOM.innerText = Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Text;
    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].textDOM);

    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].stimuliDiv);

    // Make Stimuli Buttons & images
    let maxButtons = Data.Tree[Loc].trials.reduce((a,b) => Math.max(a, b.Stimuli.length), 0)
    Data.Tree[Loc].maxButtons = maxButtons;

    for(let i=0;i<maxButtons; i++){
        Data.Tree[Loc].stimuliButtons.id = `stimuliButton_${i}`;
        //Data.Tree[Loc].stimuliDOMs.id = `stimuliDOM_${i}`;
        //Data.Tree[Loc].stimuliDOMs.parentElement = `stimuliButton_${i}`;

        if(i < Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli.length){
            //Data.Tree[Loc].stimuliDOMs.src = Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli[i];
            let imagestimuli = new Image(360,360) //! HACK
            imagestimuli.src = Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli[i]; //! HACK
            Data.Tree[Loc].Images.push(imagestimuli); //! HACK

        } else {
            //Data.Tree[Loc].stimuliDOMs.src = "";

            Data.Tree[Loc].stimuliButtons.style.display = "hidden";
        }
        
        Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].stimuliButtons);
        //Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].stimuliDOMs);

        // create eventListeners (js-default) for clicks on the button
        Tree.DOM[`${Loc}_stimuliButton_${i}`].onclick = function(){Tree.Utilities.eventEmit("click", Loc, {stimuli: i})}
    }


    // activate/deactivate Event Listeners
    Tree.Utilities.eventlistenerRemove("create", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);

}
Tree.Systems.activate_XAFCwithText = function(Loc){
    Tree.Utilities.containerHandler(Loc, "activate");

    Tree.Utilities.cssUpdate(Tree.DOM[`${Loc}_canvasDOM`],{zIndex: 0}) //! HACK
    //! HACK
    Tree.DOM[`${Loc}_canvasDOM`].getContext('2d').drawImage(Data.Tree[Loc].Images[0],120,360,360,360) //1200x800 screen | canvas
    Tree.DOM[`${Loc}_canvasDOM`].getContext('2d').drawImage(Data.Tree[Loc].Images[1],720,360,360,360)
    
    setTimeout(() => {
        // Set baseline for Timing
        Data.Tree[Loc].LoopStart = Data.Time.PN_total;
        console.log(`started timing at timestamp ${Data.Time.PN_total}`);
    }, 0)

    // (de)activate eventListeners
    Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);
    Tree.Utilities.eventlistenerActivate(`click`, Loc, Loc);
}
Tree.Systems.deactivate_XAFCwithText = function(Loc){
    Tree.Utilities.containerHandler(Loc, "deactivate");
    
    // (de)activate eventListeners
    Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
    Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerDeactivate(`click`, Loc, Loc);

    // emit child deactivated event for parent
    Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});
      
    // checking if done, and updating if not!
    // only destroy branch if we're done with the trials
    if(Data.Tree[Loc].Loop >= Data.Tree[Loc].trials.length){
        Tree.Utilities.eventEmit("destroy", Loc);
    } else {
        // Tupdate trial stuff
        Tree.DOM[`${Loc}_textDOM`].innerText = Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Text;

        Tree.DOM[`${Loc}_canvasDOM`].getContext('2d').clearRect(0,0,1800,1080); //! HACK
        Data.Tree[Loc].Images = []; //! HACK
        for (let i = 0 ; i < Data.Tree[Loc].maxButtons; i++) {
            if(i < Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli.length){
                //Tree.DOM[`${Loc}_stimuliDOM_${i}`].style.display = '';
                //Tree.DOM[`${Loc}_stimuliDOM_${i}`].src = Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli[i];
                let imagestimuli = new Image(360,360) //! HACK
                imagestimuli.src = Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli[i]; //! HACK
                Data.Tree[Loc].Images.push(imagestimuli); //! HACK

                Tree.DOM[`${Loc}_stimuliButton_${i}`].style.display = '';
            } else {
                Tree.DOM[`${Loc}_stimuliButton_${i}`].style.display = "hidden";
            }
        }

        //! HACK
        Tree.Utilities.cssUpdate(Tree.DOM[`${Loc}_canvasDOM`],{zIndex: -12})
        //! HACK
        //Tree.DOM[`${Loc}_canvasDOM`].getContext('2d').drawImage(Data.Tree[Loc].Images[0],120,360,360,360) //1200x800 screen | canvas
        //Tree.DOM[`${Loc}_canvasDOM`].getContext('2d').drawImage(Data.Tree[Loc].Images[1],720,360,360,360)
    }
}
Tree.Systems.destroy_XAFCwithText = function(Loc){
    Tree.Utilities.containerHandler(Loc, "destroy");

    // remove eventListeners
    Tree.Utilities.eventlistenerRemove("activate", Loc, Loc);
    Tree.Utilities.eventlistenerRemove("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerRemove(`destroy`, Loc, Loc);
    Tree.Utilities.eventlistenerRemove(`click`, Loc, Loc);

    // emit childDestroyed event to parent
    Tree.Utilities.eventEmit("childDestroyed", Data.Tree[Loc].parentLoc, {Child: Loc})

    // delete self
    delete Data.Tree[Loc]
}
Tree.Systems.click_XAFCwithText = function(Loc, argJSON){ 

    let newdata = {
        id: Data.Storage.id,
        age: Data.Storage.Age,
        date: Data.Time.date,
        header: Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Header,
        stimuliClicked: argJSON.stimuli,
        stimuliCorrect: Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Correct,
        imgClicked: Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli[argJSON.stimuli],
        imgCorrect: Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Stimuli[Data.Tree[Loc].trials[Data.Tree[Loc].Loop].Correct],
        timestamp: argJSON.timestamp,
        timeRT: argJSON.timestamp - Data.Tree[Loc].LoopStart
    }

    Data.Results.push(newdata);

    Tree.Utilities.eventEmit("deactivate", Loc);
    
    Data.Tree[Loc].Loop++;
}

Tree.Templates.AgeForm = {
    Template: "AgeForm",
    styleContainer: { //"display: grid; place-items: center; grid-template-columns: 1fr; grid-template-rows: 1fr; background-color: white;"
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    DOM_AgeForm: {
        id: "AgeForm",
        tagName: "form",
        style: { //"display: grid; place-items: center; grid-template-columns: 1fr; grid-template-rows: 1fr; background-color: white;"
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
        }
    },
    DOM_AgeLabel: {
        id: "AgeLabel",
        tagName: "label",
        parentElement: "AgeForm",
        for: "AgeInput",
        style: {
            fontSize: '36pt'
        },
        innerText: 'How old are you?'
    },
    DOM_AgeBR: {
        tagName: "br",
        parentElement: "AgeLabel",
    },
    DOM_AgeInput: {
        id: "AgeInput",
        tagName: 'input',
        parentElement: "AgeForm",
        type: "number",
        min: 0,
        max: 124,
        name: "AgeInput",
        style: {
            fontSize: '36pt'
        }
    },
    DOM_AgeBR2: {
        tagName: "br",
        parentElement: "AgeForm",
    },
    DOM_Button: {
        id: "AgeButton",
        tagName: "button",
        parentElement: "AgeForm",
        style: {
            fontSize: '24pt'
        },
        innerHTML: "<p>Ready!</p>"
    },
    Loop: 0,
    trials: [],
    EventListeners: [
        {type: "create",
         on: "__SELF__",
         active: true,
         systems: ["create_AgeForm"]}, 
        {type: "activate",
         on: "__SELF__",
         active: true,
         systems: ["activate_AgeForm"]
        }, 
        {type: "deactivate",
         on: "__SELF__",
         active: false,
         systems: ["deactivate_AgeForm"]
        }, 
        {type: "destroy",
         on: "__SELF__",
         active: true,
         systems: ["destroy_AgeForm"]
        },
        {type: "click",
         on: "__SELF__",
         active: false,
         systems: ["click_AgeForm"]
        }
    ]
}

Tree.Systems.create_AgeForm = function(Loc){
    // creating DOM elements
    Tree.Utilities.containerHandler(Loc, "create");

    Data.Tree[Loc].DOM_AgeLabel.for = `${Loc}_${Data.Tree[Loc].DOM_AgeLabel.for}`

    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].DOM_AgeForm);
    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].DOM_AgeLabel);
    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].DOM_AgeBR);
    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].DOM_AgeInput);
    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].DOM_AgeBR2);
    Tree.Utilities.elementCreator(Loc, Data.Tree[Loc].DOM_Button);

    Tree.DOM[`${Loc}_AgeButton`].onclick = function(){Tree.Utilities.eventEmit("click", Loc); return false}

    // activate/deactivate Event Listeners
    Tree.Utilities.eventlistenerRemove("create", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);

}
Tree.Systems.activate_AgeForm = function(Loc){
    Tree.Utilities.containerHandler(Loc, "activate");


    // (de)activate eventListeners
    Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);
    Tree.Utilities.eventlistenerActivate(`click`, Loc, Loc);
}
Tree.Systems.deactivate_AgeForm = function(Loc){
    Tree.Utilities.containerHandler(Loc, "deactivate");
    
    // (de)activate eventListeners
    Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
    Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerDeactivate(`click`, Loc, Loc);

    // emit child deactivated event for parent
    Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});
      
    Tree.Utilities.eventEmit("destroy", Loc);
}
Tree.Systems.destroy_AgeForm = function(Loc){
    Tree.Utilities.containerHandler(Loc, "destroy");

    // remove eventListeners
    Tree.Utilities.eventlistenerRemove("activate", Loc, Loc);
    Tree.Utilities.eventlistenerRemove("deactivate", Loc, Loc);
    Tree.Utilities.eventlistenerRemove(`destroy`, Loc, Loc);
    Tree.Utilities.eventlistenerRemove(`click`, Loc, Loc);

    // emit childDestroyed event to parent
    Tree.Utilities.eventEmit("childDestroyed", Data.Tree[Loc].parentLoc, {Child: Loc})

    // delete self
    delete Data.Tree[Loc]
}
Tree.Systems.click_AgeForm = function(Loc, argJSON){

    if(Tree.DOM[`${Loc}_AgeInput`].value != ""){
        Data.Storage.Age = Tree.DOM[`${Loc}_AgeInput`].value;

        document.getElementById("main").requestFullscreen();

        screen.orientation.lock("landscape");
        
        Tree.Utilities.eventEmit("deactivate", Loc);
        
        Data.Tree[Loc].Loop++;

        //alert(`Your id is: ${Data.Storage.id}`)
    } else {
        alert("Please input your age before continuing!")
    }
}