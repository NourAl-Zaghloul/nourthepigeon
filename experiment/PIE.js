Tree = {
    Procedures: {
        begin: function(sapling, settings = {}){
            // TODO: Create #main if not there already
            Tree.DOM.main = document.getElementById("main");

            Tree.Utilities.createTree(sapling);

            // Get user technical data
            Data.Specs.URL = Tree.Utilities.getURL();
            Data.Specs.OS = Tree.Utilities.getOS();
            Data.Specs.Browser = Tree.Utilities.getBrowser();

            requestAnimationFrame(Tree.Procedures.idle)
        },
        idle: function(timestamp){
            Tree.Procedures.timing(timestamp);

            //Tree.Procedures.eventManager(); // goes through all the logged events and deals with them
            Tree.Procedures.eventHandling();
            
            Tree.Utilities.checkEnd();

            if(Data.End){
                Tree.Procedures.end();
            } else {
                requestAnimationFrame(Tree.Procedures.idle)
            }
        },
        end: function(){
            // TODO: [[Event]] 'End' function list
            // TODO: Actually do something in end()
            console.log("Yay it's over! :)")
            delete Data;
            delete Tree;
        },

        timing: function(timestamp){ 
            Data.Time.frame++;
            // gets/sets the current time
            if(Data.Time.RAF_last == 0){
                Data.Time.PN_start = performance.now();
                Data.Time.PN_startAbsolute = Data.Time.PN_start;
                Data.Time.PN_current = Data.Time.PN_start;
        
                Data.Time.RAF_last = timestamp;
                Data.Time.RAF_current = timestamp;

                Data.Time.date = Tree.Utilities.getDate();
            } else {
                Data.Time.PN_current = performance.now();
        
                Data.Time.RAF_last = Data.Time.RAF_current;
                Data.Time.RAF_current = timestamp;
            }
        
            // update total timing (+delta)
            Data.Time.RAF_delta = Data.Time.RAF_current - Data.Time.RAF_last;
            Data.Time.RAF_total += Data.Time.RAF_delta;
        
            Data.Time.PN_total = Data.Time.PN_current - Data.Time.PN_start;
            Data.Time.PN_totalAbsolute = Data.Time.PN_current - Data.Time.PN_startAbsolute;
        
            // calculate frame data
            Data.Time.frameTime_actual = Data.Time.RAF_delta;
            Data.Time.frame !== 0 ? Data.Time.framesDropped += Math.floor(Math.abs(Data.Time.frameTime_actual/Data.Time.frameTime_ideal-1)) : false;
            if(Data.Time.logout){
                if(Data.Time.total_diff >= Data.Time.frameTime_ideal || Data.Time.total_diff <= -Data.Time.frameTime_ideal){
                    console.log(`${Data.Time.total_diff} @ frame ${Data.Time.frame}.`);
                }
            }
        
            // drift correction
            Data.Time.total_diff = Data.Time.RAF_total - Data.Time.PN_total;
            Data.Time.log.push(Data.Time.total_diff)
            if(Data.Time.frame % 60 == 0){
                Data.Time.log_mean = Data.Time.log.reduce((a, b) => a + b, 0)/60;
                Data.Time.PN_start -= Data.Time.log_mean;
                Data.Time.log_sd = Math.sqrt(Data.Time.log.map(x => Math.pow(x - Data.Time.log_mean, 2)).reduce((a, b) => a + b) / 60);
                Data.Time.log = [];
                if(Data.Time.logout){console.log(`Frame ${Data.Time.frame} reached with ${Data.Time.log_mean} ms of drift and sd of ${Data.Time.log_sd}`)};
            }
        
            // Lets others know a tick has occured
            Tree.Utilities.eventEmit("tick", "Tree")
        },
        eventHandling: function(){
            // [TODO+1]: skip rest of queue if taking too long 
            // [TODO+6]: remove redundancy (if any) on emitted events
            for(let i=0; i < Data.EventQueue.length; i++){
                let eventShorthand = Data.EventListeners[`${Data.EventQueue[i].type}_${Data.EventQueue[i].on}`];
                // console.log(`${Data.EventQueue[i].type}_${Data.EventQueue[i].on}`)

                if(eventShorthand !== undefined){
                    for(let j=0; j < eventShorthand.length; j++){
                        if(eventShorthand[j].Active == true){
                            for(let k=0; k < eventShorthand[j].Systems.length; k++){
                                if(Data.EventQueue[i].arguments === undefined){Data.EventQueue[i].arguments = {}};

                                Data.EventQueue[i].arguments.timestamp = Data.EventQueue[i].timestamp;

                                Tree.Systems[eventShorthand[j].Systems[k]](eventShorthand[j].Loc, Data.EventQueue[i].arguments);
                            }
                        }
                    }
                }
            }
            Data.EventQueue = [];
        }
    },

    Templates: {
        TwoAFC: {
            Template: "TwoAFC",
            reset: false, // boolean: instead of ending when hitting the last stimuli, reset
            randomize: false, // boolean: shuffles the stimuli trials
            Type: "p", //p, img
            styleContent: "text-align: center; font-size: 20;",
            styleButton: "height: 30vh; width: 30vh;",
            styleDiv: "display: grid; place-items: center; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; background-color: white;",
            Loops: [],
            Loop: 0,
            EventListeners : [
                {type: "create",
                 on: "__SELF__",
                 active: true,
                 systems: ["create_TwoAFC"]}, 
                {type: "activate",
                 on: "__SELF__",
                 active: true,
                 systems: ["activate_TwoAFC"]
                }, 
                {type: "deactivate",
                 on: "__SELF__",
                 active: false,
                 systems: ["deactivate_TwoAFC"]
                }, 
                {type: "destroy",
                 on: "__SELF__",
                 active: true,
                 systems: ["destroy_TwoAFC"]
                },
                {type: "click",
                 on: "__SELF__",
                 active: false,
                 systems: ["click_TwoAFC"]
                }
            ]
        },
        Kindness2AFC: {
            Template: "Kindness2AFC",
            Type: "img", //p, img, html, etc
            reset: true, // boolean: instead of ending when hitting the last stimuli, reset
            randomize: true, // boolean: shuffles the stimuli trials
            styleContent: "height: 100%; width: 100%; margin: 0; padding: 0; border: 0;",
            DelayTransition: 1250,
            styleButton: "height: 100%; width: 100%; transform: translateY(100vh); transition: transform 1s ease .25s; user-select: none; margin: 0; padding: 0; border: 0;",
            styleTimer: "height: 100%; width: 100%; background-color: black; transform: translateY(100vh); transition: transform 1s ease .25s; user-select: none; margin: 0; padding: 0; border: 1px solid black;",
            styleDiv: "display: grid; place-items: center; grid-template-columns: 2fr 1fr 2fr; grid-template-rows: 1fr 4fr; background-color: white; position:absolute; left: 110vw; grid-column-gap: 0px;",
            stylePrompt: "grid-column: 1 / span 5; text-align: center;",
            TimeLimit: 2000,
            Loops: [],
            Loop: 0,
            EventListeners : [
                {type: "create",
                 on: "__SELF__",
                 active: true,
                 systems: ["create_Kindness2AFC"]}, 
                {type: "activate",
                 on: "__SELF__",
                 active: true,
                 systems: ["activate_Kindness2AFC"]
                }, 
                {type: "deactivate",
                 on: "__SELF__",
                 active: false,
                 systems: ["deactivate_Kindness2AFC"]
                }, 
                {type: "destroy",
                 on: "__SELF__",
                 active: true,
                 systems: ["destroy_TwoAFC"]
                },
                {type: "click",
                 on: "__SELF__",
                 active: false,
                 systems: ["click_TwoAFC"]
                },
                {type: "tick",
                 on: "Tree",
                 active: false,
                 systems: ["tick_Kindness2AFC"]
                }
            ]
        },
        LogicGroup: {
            Template: "LogicGroup",
            Active: false,
            resetTrialIncrement: false, // TODO: implement
            deactivate_LoopLimit: 999999999, 
            deactivate_groupTravel: 999999999, 
            destroy_ChildrenDestroyed: 999999999, // TODO: implement as a percentage OR integer!
            Loops: 0,
            resetDeactivate: false,
            groupSpot: 0,
            groupStart: 0,
            group: [],
            onActivate_zero_groupSpot: false,
            // bag: [],
            groupRandomize: false, // determines if you randomize the trial locations in a window or not
            // groupArray: [1], // determines how many of each trial to show in a window
            // groupPick: false, // if pick is a number, how many sub-groups you'll next in a set before reset-ing
            // groupPickWithReplacement: false, //whether it chooses the set as with Replacement or not
            EventListeners : [
                {type: "create",
                 on: "__SELF__",
                 active: true,
                 systems: ["create_LogicGroup"]}, 
                {type: "activate",
                 on: "__SELF__",
                 active: true,
                 systems: ["activate_LogicGroup"]
                }, 
                {type: "deactivate",
                 on: "__SELF__",
                 active: false,
                 systems: ["deactivate_LogicGroup"]
                }, 
                {type: "destroy",
                 on: "__SELF__",
                 active: true,
                 systems: ["destroy_LogicGroup"]
                },
                {type: "childDeactivated",
                 on: "__SELF__",
                 active: true,
                 systems: ["childDeactivated_LogicGroup"]
                },
                {type: "childDestroyed",
                 on: "__SELF__",
                 active: true,
                 systems: ["childDestroyed_LogicGroup"]
                }
            ]
        },
        Fixation: {
            Template: "Fixation",
            styleDiv: "display: grid; place-items: center; grid-template-columns: 1fr; grid-template-rows: 1fr; background-color: white;",
            styleButton: "height: 30vh; width: 30vh; border-radius: 50%; background-color: red;",
            altTextButton: "start button",
            Loop: 0,
            waitTime: 0,
            EventListeners: [
                {type: "create",
                 on: "__SELF__",
                 active: true,
                 systems: ["create_Fixation"]}, 
                {type: "activate",
                 on: "__SELF__",
                 active: true,
                 systems: ["activate_Fixation"]
                }, 
                {type: "deactivate",
                 on: "__SELF__",
                 active: false,
                 systems: ["deactivate_Fixation"]
                }, 
                {type: "destroy",
                 on: "__SELF__",
                 active: true,
                 systems: ["destroy_Fixation"]
                },
                {type: "click",
                 on: "__SELF__",
                 active: false,
                 systems: ["click_Fixation"]
                }
            ]
        },
        Codeblock: {
            Template: "Codeblock",
            customCodeblock: "sayhi",
            EventListeners: [
                {type: "create",
                 on: "__SELF__",
                 active: true,
                 systems: ["create_Codeblock"]}, 
                {type: "activate",
                 on: "__SELF__",
                 active: true,
                 systems: ["activate_Codeblock"]
                }, 
                {type: "deactivate",
                 on: "__SELF__",
                 active: false,
                 systems: ["deactivate_Codeblock"]
                }, 
                {type: "destroy",
                 on: "__SELF__",
                 active: true,
                 systems: ["destroy_Codeblock"]
                }
            ] 
        }
    },
    Systems: {
        sayhi : function(Condition, Loc, argJSON){
            switch(Condition){
                case 'create':
                    console.log(`hi ${Loc}`);
                    break;
            }
            
        
        },
        create_Codeblock: function(Loc, argJSON){

            Tree.Systems[Data.Tree[Loc].customCodeblock]("create", Loc, argJSON);

            // activate/deactivate Event Listeners
            Tree.Utilities.eventlistenerRemove("create", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
        },
        activate_Codeblock: function(Loc, argJSON){
            
            Tree.Systems[Data.Tree[Loc].customCodeblock]("activate", Loc, argJSON);

            // (de)activate eventListeners
            Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);

            // deactivate
            Tree.Utilities.eventEmit("deactivate", Loc);
        },
        deactivate_Codeblock: function(Loc, argJSON){
            
            Tree.Systems[Data.Tree[Loc].customCodeblock]("deactivate", Loc, argJSON);

            // (de)activate eventListeners
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);

            // emit child deactivated event for parent
            Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});
        },
        destroy_Codeblock: function(Loc, argJSON){
            
            Tree.Systems[Data.Tree[Loc].customCodeblock]("destroy", Loc, argJSON);

            // remove eventListeners
            Tree.Utilities.eventlistenerRemove("activate", Loc, Loc);
            Tree.Utilities.eventlistenerRemove("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerRemove(`destroy`, Loc, Loc);
            
            // emit childDestroyed event to parent
            Tree.Utilities.eventEmit("childDestroyed", Data.Tree[Loc].parentLoc, {Child: Loc})

            // delete self
            delete Data.Tree[Loc];
        },
        create_TwoAFC: function(Loc){
            Tree.DOM[Loc] = document.createElement("div");
            Tree.DOM[Loc].id = Loc;
            Tree.DOM[Loc].className = "fullsize";
            Tree.DOM[Loc].style.cssText = Data.Tree[Loc].styleDiv;
            
            // Create the buttons
            Tree.DOM[`${Loc}_buttonLeft`] = document.createElement("button")
            Tree.DOM[`${Loc}_buttonLeft`].id = `${Loc}_buttonLeft`;
            Tree.DOM[`${Loc}_buttonLeft`].style.cssText = Data.Tree[Loc].styleButton;

            Tree.DOM[`${Loc}_buttonRight`] = document.createElement("button")
            Tree.DOM[`${Loc}_buttonRight`].id = `${Loc}_buttonRight`;
            Tree.DOM[`${Loc}_buttonRight`].style.cssText = Data.Tree[Loc].styleButton;
            
            // attach buttons to the DOM
            Tree.DOM[Loc].appendChild(Tree.DOM[`${Loc}_buttonLeft`]);
            Tree.DOM[Loc].appendChild(Tree.DOM[`${Loc}_buttonRight`]);

            // create content of the buttons
            Tree.DOM[`${Loc}_buttonLeft_content`] = document.createElement(Data.Tree[Loc].Type)
            Tree.DOM[`${Loc}_buttonLeft_content`].id = `${Loc}_buttonLeft_content`;
            Tree.DOM[`${Loc}_buttonLeft_content`].style.cssText = Data.Tree[Loc].styleContent;

            Tree.DOM[`${Loc}_buttonRight_content`] = document.createElement(Data.Tree[Loc].Type)
            Tree.DOM[`${Loc}_buttonRight_content`].id = `${Loc}_buttonRight_content`;
            Tree.DOM[`${Loc}_buttonRight_content`].style.cssText = Data.Tree[Loc].styleContent;

            // attach button content to the buttons
            Tree.DOM[`${Loc}_buttonLeft`].appendChild(Tree.DOM[`${Loc}_buttonLeft_content`])
            Tree.DOM[`${Loc}_buttonRight`].appendChild(Tree.DOM[`${Loc}_buttonRight_content`])

            // create eventListeners (js-default) for clicks on the button
            Tree.DOM[`${Loc}_buttonLeft`].onclick = function(){Tree.Utilities.eventEmit("click", Loc, {Side: "Left"})}
            Tree.DOM[`${Loc}_buttonRight`].onclick = function(){Tree.Utilities.eventEmit("click", Loc, {Side: "Right"})}

            // create DOM list
            Data.Tree[Loc].DOMs = [Loc, `${Loc}_buttonLeft`, `${Loc}_buttonRight`, `${Loc}_buttonLeft_content`, `${Loc}_buttonRight_content`]

            // shuffles data if toggled
            if(Data.Tree[Loc].randomize){
                Data.Tree[Loc].Loops = Tree.Utilities.Shuffle(Data.Tree[Loc].Loops)
            }
            
            // activate/deactivate Event Listeners
            Tree.Utilities.eventlistenerRemove("create", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
        },
        activate_TwoAFC: function(Loc){
            switch(Data.Tree[Loc].Type){
                case "p":
                    Tree.DOM[`${Loc}_buttonLeft_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                    Tree.DOM[`${Loc}_buttonRight_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                    break;
                case "img":
                    Tree.DOM[`${Loc}_buttonLeft_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                    Tree.DOM[`${Loc}_buttonRight_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                    break;
                case "div":
                    Tree.DOM[`${Loc}_buttonLeft_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                    Tree.DOM[`${Loc}_buttonRight_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                    break;
            }
            Tree.DOM.main.appendChild(Tree.DOM[Loc]);
            Tree.DOM[Loc].style.display = "grid";

            // Set baseline for timing
            Data.Tree[Loc].LoopStart = Data.Time.PN_total;

            // (de)activate eventListeners
            Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);
            Tree.Utilities.eventlistenerActivate(`click`, Loc, Loc);
        },
        deactivate_TwoAFC: function(Loc){
            Tree.DOM[Loc].style.display = "none";
            Data.Tree[Loc].Loop++;
            Tree.DOM.main.removeChild(Tree.DOM[Loc]);

            // (de)activate eventListeners
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerDeactivate(`click`, Loc, Loc);

            // emit child deactivated event for parent
            Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});

            // check to see if it's completely done(if so, trigger destroy)
            if(Data.Tree[Loc].Loop >= Data.Tree[Loc].Loops.length){
                if(Data.Tree[Loc].reset){
                    if(Data.Tree[Loc].randomize){
                        Data.Tree[Loc].Loops = Tree.Utilities.Shuffle(Data.Tree[Loc].Loops)
                    }
                    Data.Tree[Loc].Loop = 0;
                } else {
                    Tree.Utilities.eventEmit("destroy", Loc);
                }
            } 
            
        },
        destroy_TwoAFC: function(Loc){ 
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
        },
        click_TwoAFC: function(Loc, argJSON){ // TODO clean up data collection (make more flexible) -- event?--
            // console.log(`Participant hit the ${argJSON.Side} target at ${Data.Time.PN_current}ms for an rt of ${argJSON.timestamp - Data.Tree[Loc].LoopStart}ms. Left was ${Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left} while Right was ${Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right}`);
            
            Data.Results.push({
                Entity: Loc,
                id: Data.Storage.id,
                timeStamp: argJSON.timestamp,
                Loop: Data.Tree[Loc].Loop,
                Type: Data.Tree[Loc].Type,
                Side: argJSON.Side || "TimedOut",
                timeRT: argJSON.timestamp - Data.Tree[Loc].LoopStart,
                contentLeft: Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left,
                contentRight: Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right,
                contentPrompt: Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Prompt
            })

            Tree.Utilities.eventEmit("deactivate", Loc, Loc);
        },
        create_Kindness2AFC: function(Loc){
            Tree.Systems.create_TwoAFC(Loc);

            Tree.DOM[`${Loc}_buttonLeft`].classList.add('row2');
            Tree.DOM[`${Loc}_buttonRight`].classList.add('row2');

            // Create the fixationButton
            Tree.DOM[`${Loc}_Timer`] = document.createElement("div")
            Tree.DOM[`${Loc}_Timer`].id = `${Loc}_Timer`;
            Tree.DOM[`${Loc}_Timer`].style.cssText = Data.Tree[Loc].styleTimer;
            Tree.DOM[`${Loc}_Timer`].classList.add('row2');

            // Create the Prompt
            Tree.DOM[`${Loc}_Prompt`] = document.createElement("h1")
            Tree.DOM[`${Loc}_Prompt`].id = `${Loc}_Prompt`;
            Tree.DOM[`${Loc}_Prompt`].style.cssText = Data.Tree[Loc].stylePrompt;
            Tree.DOM[`${Loc}_Prompt`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Prompt;
            Tree.DOM[`${Loc}_Prompt`].style.userSelect = "none";
            
            // attach buttons to the DOM
            Tree.DOM[`${Loc}_buttonRight`].parentNode.insertBefore(Tree.DOM[`${Loc}_Timer`], Tree.DOM[`${Loc}_buttonRight`]);
            Tree.DOM[`${Loc}`].appendChild(Tree.DOM[`${Loc}_Prompt`])

            switch(Data.Tree[Loc].Type){
                case "p":
                    Tree.DOM[`${Loc}_buttonLeft_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                    Tree.DOM[`${Loc}_buttonRight_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                break;
                case "img":
                    Tree.DOM[`${Loc}_buttonLeft_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                    Tree.DOM[`${Loc}_buttonRight_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                break;
                case "div":
                    Tree.DOM[`${Loc}_buttonLeft_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                    Tree.DOM[`${Loc}_buttonRight_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                break;
            }
            Tree.DOM.main.appendChild(Tree.DOM[Loc]);
        },
        activate_Kindness2AFC: function(Loc){

            // (de)activate eventListeners
            Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);

            // show DOM
            Tree.DOM[Loc].style.left = "";
            Tree.DOM[`${Loc}_buttonLeft`].style['pointer-events'] = "none";
            Tree.DOM[`${Loc}_buttonRight`].style['pointer-events'] = "none";
            Tree.DOM[`${Loc}_buttonLeft`].style.transition = "transform 1s ease .25s";
            Tree.DOM[`${Loc}_buttonRight`].style.transition = "transform 1s ease .25s";
            Tree.DOM[`${Loc}_Timer`].style.transition = "transform 1s ease .25s";
            Tree.DOM[`${Loc}_buttonLeft`].style.transform = "";
            Tree.DOM[`${Loc}_buttonRight`].style.transform = "";
            Tree.DOM[`${Loc}_Timer`].style.transform = "";

            setTimeout(() => {
                // Set baseline for 
                Data.Tree[Loc].LoopStart = Data.Time.PN_total;
                Tree.Utilities.eventlistenerActivate(`click`, Loc, Loc);
                Tree.DOM[`${Loc}_buttonLeft`].style['pointer-events'] = "";
                Tree.DOM[`${Loc}_buttonRight`].style['pointer-events'] = "";
                
                
                Tree.DOM[`${Loc}_Timer`].style.transition = `transform ease-out ${Data.Tree[Loc].TimeLimit/1000}s`;
                Tree.DOM[`${Loc}_Timer`].style.transform = "translateY(100%)";

                
                Tree.Utilities.eventlistenerActivate("tick", "Tree", Loc);
            }, Data.Tree[Loc].DelayTransition)
        },
        deactivate_Kindness2AFC: function(Loc){
            Tree.Utilities.eventlistenerDeactivate("tick", "Tree", Loc);
            Tree.DOM[`${Loc}_Timer`].style.transform = "translateY(101vh)";
            Tree.DOM[`${Loc}_Timer`].style.transition = "transform 1.25s";

            switch(Data.Results.slice(-1)[0].Side){
                case "Left":
                    Tree.DOM[`${Loc}_buttonLeft`].style.transform = "translateY(-100vh)";
                    Tree.DOM[`${Loc}_buttonRight`].style.transform = "translateX(100vw)";
                    break;
                case "Right":
                    Tree.DOM[`${Loc}_buttonLeft`].style.transform = "translateX(-100vw)";
                    Tree.DOM[`${Loc}_buttonRight`].style.transform = "translateY(-100vh)";
                    break;
                default:
                    Tree.DOM[`${Loc}_buttonLeft`].style.transform = "translateY(100vh)";
                    Tree.DOM[`${Loc}_buttonRight`].style.transform = "translateY(100vh)";
                    break;
            }

            Tree.DOM[`${Loc}_buttonLeft`].style['pointer-events'] = "none";
            Tree.DOM[`${Loc}_buttonRight`].style['pointer-events'] = "none";
            
            setTimeout(() => {
                Tree.DOM[Loc].style.left = "110vw";
                Tree.DOM[`${Loc}_buttonLeft`].style.transition = "";
                Tree.DOM[`${Loc}_buttonRight`].style.transition = "";
                Tree.DOM[`${Loc}_Timer`].style.transition = "";
                Tree.DOM[`${Loc}_buttonLeft`].style.transform = "translateY(100vh)";
                Tree.DOM[`${Loc}_buttonRight`].style.transform = "translateY(100vh)";
                Tree.DOM[`${Loc}_Timer`].style.transform = "translateY(100vh)";
                Tree.DOM[`${Loc}_buttonLeft`].style['pointer-events'] = "";
                Tree.DOM[`${Loc}_buttonRight`].style['pointer-events'] = "";

                Data.Tree[Loc].Loop++;

                // (de)activate eventListeners
                Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
                Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);
                Tree.Utilities.eventlistenerDeactivate(`click`, Loc, Loc);

                // emit child deactivated event for parent
                Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});

                // check to see if it's completely done(if so, trigger destroy)
                if(Data.Tree[Loc].Loop >= Data.Tree[Loc].Loops.length){
                    if(Data.Tree[Loc].reset){
                        if(Data.Tree[Loc].randomize){
                            Data.Tree[Loc].Loops = Tree.Utilities.Shuffle(Data.Tree[Loc].Loops)
                        }
                        Data.Tree[Loc].Loop = 0;

                        switch(Data.Tree[Loc].Type){
                            case "p":
                                Tree.DOM[`${Loc}_buttonLeft_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                                Tree.DOM[`${Loc}_buttonRight_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                            break;
                            case "img":
                                Tree.DOM[`${Loc}_buttonLeft_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                                Tree.DOM[`${Loc}_buttonRight_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                            break;
                            case "div":
                                Tree.DOM[`${Loc}_buttonLeft_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                                Tree.DOM[`${Loc}_buttonRight_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                            break;
                        }
                    } else {
                        Tree.Utilities.eventEmit("destroy", Loc);
                    }
                } else {
                    switch(Data.Tree[Loc].Type){
                        case "p":
                            Tree.DOM[`${Loc}_buttonLeft_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                            Tree.DOM[`${Loc}_buttonRight_content`].innerText = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                        break;
                        case "img":
                            Tree.DOM[`${Loc}_buttonLeft_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                            Tree.DOM[`${Loc}_buttonRight_content`].src = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                        break;
                        case "div":
                            Tree.DOM[`${Loc}_buttonLeft_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Left;
                            Tree.DOM[`${Loc}_buttonRight_content`].style.backgroundColor = Data.Tree[Loc].Loops[Data.Tree[Loc].Loop].Right;
                        break;
                    }
                }
            }, Data.Tree[Loc].DelayTransition)
        },
        tick_Kindness2AFC: function(Loc, argJSON){
            if(argJSON.timestamp - Data.Tree[Loc].LoopStart > Data.Tree[Loc].TimeLimit){
                console.log('ticked')
                Tree.Utilities.eventEmit('click', Loc)
            }
        },
        create_LogicGroup: function(Loc){

            // Data.Tree[Loc].bag = Data.Tree[Loc].Children;
            Data.Tree[Loc].group = Data.Tree[Loc].groupRandomize ? Tree.Utilities.Shuffle(Data.Tree[Loc].Children) : Data.Tree[Loc].Children;


            // Track how many children it has had
            Data.Tree[Loc].ChildrenCount = Data.Tree[Loc].Children.length;

            // activate/deactivate Event Listeners
            Tree.Utilities.eventlistenerRemove("create", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
        },
        activate_LogicGroup: function(Loc){
            // set to "active" to avoid looping on deactivate
            Data.Tree[Loc].Active = true;

            if(Data.Tree[Loc].onActivate_zero_groupSpot){
                Data.Tree[Loc].groupSpot = 0;
            }

            Data.Tree[Loc].groupStart = Data.Tree[Loc].groupSpot;

            // activate child
            Tree.Utilities.eventEmit("activate", Data.Tree[Loc].group[Data.Tree[Loc].groupSpot])
            
            // (de)activate eventListeners
            Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);
        },
        deactivate_LogicGroup: function(Loc){
            console.log(Loc)

            // Data.Tree[Loc].Loops++;
            Data.Tree[Loc].Active = false;

            // (de)activate eventListeners
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);

            // emit child deactivated event for parent
            Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});
            // emit deactivate event for each child
            for(let count=0; count >= Data.Tree[Loc].length; count++){
                Tree.Utilities.eventEmit("deactivate", Data.Tree[Loc].Children[count]);
            }

            // TODO! check to see if it's completely done(if so, trigger destroy)
        },
        destroy_LogicGroup: function(Loc){
            // remove eventListeners
            Tree.Utilities.eventlistenerRemove("activate", Loc, Loc);
            Tree.Utilities.eventlistenerRemove("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerRemove(`destroy`, Loc, Loc);
            Tree.Utilities.eventlistenerRemove(`childDeactivated`, Loc, Loc);
            Tree.Utilities.eventlistenerRemove(`childDestroyed`, Loc, Loc);
            
            // emit childDestroyed event to parent
            Tree.Utilities.eventEmit("childDestroyed", Data.Tree[Loc].parentLoc, {Child: Loc})
            // emit destroy event to remaining children
            for(let count=0; count < Data.Tree[Loc].Children.length; count++){
                Tree.Utilities.eventEmit("destroy", Data.Tree[Loc].Children[count]);
            }

            // delete self
            delete Data.Tree[Loc]
        },
        childDeactivated_LogicGroup: function(Loc){
            if(Data.Tree[Loc].Active){
                // increment groupSpot
                Data.Tree[Loc].groupSpot++;

                // check to see if self should be deactivated/the bag reset
                if(Data.Tree[Loc].groupSpot >= Data.Tree[Loc].group.length){
                    Data.Tree[Loc].groupSpot = 0; 
                    Data.Tree[Loc].Loops++;
                    switch(true){
                        case Data.Tree[Loc].resetDeactivate:
                        case Data.Tree[Loc].Loops >= Data.Tree[Loc].deactivate_LoopLimit:
                            console.log('deactivate Loop')
                            Tree.Utilities.eventEmit("deactivate", Loc);
                            break;
                        default:
                            Data.Tree[Loc].group = Data.Tree[Loc].groupRandomize ? Tree.Utilities.Shuffle(Data.Tree[Loc].Children) : Data.Tree[Loc].group;
                            Tree.Utilities.eventEmit("activate", Data.Tree[Loc].group[Data.Tree[Loc].groupSpot]);
                            break;
                    }
                } else { // If not, activate the next one
                    if(Data.Tree[Loc].groupSpot - Data.Tree[Loc].groupStart >= Data.Tree[Loc].deactivate_groupTravel){
                        console.log('deactivate groupTravel')
                        Tree.Utilities.eventEmit("deactivate", Loc);
                    } else {  
                        Tree.Utilities.eventEmit("activate", Data.Tree[Loc].group[Data.Tree[Loc].groupSpot])
                    }
                }

                
                

                
            }
        },
        childDestroyed_LogicGroup: function(Loc, argJSON){ 
            // Remove child from bag & reform group as necessary
            Data.Tree[Loc].Children = Data.Tree[Loc].Children.filter(x => x !== argJSON.Child);
            
            if(Data.Tree[Loc].group.findIndex((x) => x == argJSON.Child) <= Data.Tree[Loc].groupSpot){
                Data.Tree[Loc].groupSpot--
            } 

            Data.Tree[Loc].group = Data.Tree[Loc].group.filter(x => x !== argJSON.Child);

            if(Data.Tree[Loc].Children.length == 0 || Data.Tree[Loc].ChildrenCount - Data.Tree[Loc].Children.length >= Data.Tree[Loc].destroy_ChildrenDestroyed){
                Tree.Utilities.eventEmit("destroy", Loc);
            }

            // TODO! if need to increment loop 
        },
        create_Fixation: function(Loc){
            Tree.DOM[Loc] = document.createElement("div");
            Tree.DOM[Loc].id = Loc;
            Tree.DOM[Loc].className = "fullsize";
            Tree.DOM[Loc].style.cssText = Data.Tree[Loc].styleDiv;
            
            // Create the buttons
            Tree.DOM[`${Loc}_button`] = document.createElement("button")
            Tree.DOM[`${Loc}_button`].id = `${Loc}_button`;
            Tree.DOM[`${Loc}_button`].style.cssText = Data.Tree[Loc].styleButton;
            Tree.DOM[`${Loc}_button`].ariaLabel = Data.Tree[Loc].altTextButton;
            
            // attach buttons to the DOM
            Tree.DOM[Loc].appendChild(Tree.DOM[`${Loc}_button`]);

            // create eventListeners (js-default) for clicks on the button
            Tree.DOM[`${Loc}_button`].onclick = function(){Tree.Utilities.eventEmit("click", Loc)}

            // create DOM list
            Data.Tree[Loc].DOMs = [Loc, `${Loc}_button`]

            // activate/deactivate Event Listeners
            Tree.Utilities.eventlistenerRemove("create", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
        },
        activate_Fixation: function(Loc){
            Tree.DOM.main.appendChild(Tree.DOM[Loc]);
            Tree.DOM[Loc].style.display = "grid";

            // Set baseline for 
            Data.Tree[Loc].LoopStart = Data.Time.PN_current;

            // (de)activate eventListeners
            Tree.Utilities.eventlistenerDeactivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerActivate("destroy", Loc, Loc);
            Tree.Utilities.eventlistenerActivate(`click`, Loc, Loc);
        },
        deactivate_Fixation: function(Loc){
            // (de)activate eventListeners
            Tree.Utilities.eventlistenerActivate("activate", Loc, Loc);
            Tree.Utilities.eventlistenerDeactivate("deactivate", Loc, Loc);
            Tree.Utilities.eventlistenerDeactivate(`click`, Loc, Loc);

            // emit child deactivated event for parent
            if(Data.Tree[Loc].waitTime > 0){
                setTimeout(() => {
                    Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});

                    Tree.DOM[Loc].style.display = "none";
                    Data.Tree[Loc].Loop++;
                    Tree.DOM.main.removeChild(Tree.DOM[Loc]);
                }, Data.Tree[Loc].waitTime)
            } else {
                Tree.Utilities.eventEmit("childDeactivated", Data.Tree[Loc].parentLoc, {Child: Loc});
                
                Tree.DOM[Loc].style.display = "none";
                Data.Tree[Loc].Loop++;
                Tree.DOM.main.removeChild(Tree.DOM[Loc]);
            }

            // check to see if it's completely done(if so, trigger destroy)
            // if(Data.Tree[Loc].Loop >= Data.Tree[Loc].Loops.length){
            //     Tree.Utilities.eventEmit("destroy", Loc);
            // } 
            
        },
        destroy_Fixation: function(Loc){ 
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
        },
        click_Fixation: function(Loc){ 
            Tree.Utilities.eventEmit("deactivate", Loc, Loc);
        },
    },

    Utilities: {
        // Random Functions
        createRatioObjArray: function(objs, arrayData = [1], randomize = false){
            // tempdata to hold the return product
            let createRatioObjArrayTEMP = [];

            // corrects arrayData length if necessary
            arrayData = Tree.Utilities.fixArrayLength(arrayData, objs.length);

            // creates the ratio'd object array
            for(cROAi = 0; cROAi < arrayData.length; cROAi++){
                for(cROAj = 0; cROAj < arrayData[cROAi]; cROAj++){
                    createRatioObjArrayTEMP.push(objs[cROAi]);
                }
            }
        
            //shuffles the array if wanted
            if(randomize){
                CAOsExp.functions.shuffle(createRatioObjArrayTEMP);
            }
        
            return createRatioObjArrayTEMP;
        },
        fixArrayLength: function(array, length){
            // corrects arrayData based on length

            // makes it an array if it's just a value
            if(!Array.isArray(array)){
                array = [array];
            }
        
            switch (true) {
                case array.length > length: // if it's too long, it cuts off the excess
                    return array.slice(0, length);
                    break;
                case array.length < length: // if it's too short it repeats until it's done
                    let backtrack = array.length
                    for (i = array.length; i < length; i++) {
                        array.push(array[i - backtrack]);
                    }
                    return [...array];
                    break;
                default:
                    return array;
                    break;
            }
        },
        Shuffle: function(array) {
            array = array.slice(); // Creates a shallow copy so we don't affect the original array
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array
        },
        uuid: function(){
            /*
            * I started to do something fancy, but then I found someone who had the same idea and used the same crypto API, but did it better
            * source: https://stackoverflow.com/a/2117523
            */
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },

        // Tree Functioning
        createTree: function(sapling, Loc = undefined){
            if(Loc === undefined){
                sapling.Loc = "_0";
            } else {
                sapling.Loc = Loc;
            }

            Tree.Utilities.eventEmit("create", sapling.Loc);

            Tree.Utilities.fillManager(sapling);

            for(let j = 0; j < sapling.Children.length; j++){
                Tree.Utilities.createTree(sapling.Children[j], `${sapling.Loc}_${j}`);
            };
        },
        fillManager: function(sprig){
            // create data structure
            let bud = structuredClone(sprig);

            // Setting Parent Location (messy but it works)
            bud.parentLoc = bud.Loc.split("_").slice(0, -1).reduce((accumulator, currentValue) => `${accumulator}_${currentValue}`);

            // Denote Children Array by Loc
            if(!Array.isArray(sprig.Children)){
                sprig.Children = [];
            }  
            bud.Children = [];
            for(let child = 0; child < sprig.Children.length; child++){
                bud.Children.push(`${bud.Loc}_${child}`);
            }
            
            // checks to see if the loc is _0 & if so: emits activate event to
            if(bud.Loc === "_0"){Tree.Utilities.eventEmit("activate", bud.Loc)}

            // Fills out the bud via the template
            Tree.Utilities.addDefaults(bud, Tree.Templates[bud.Template])
            Tree.Utilities.addDefaults_eventListeners(bud);

            // Creates node in Data.Tree
            Data.Tree[bud.Loc] = bud;
        },
        addDefaults: function(original, Template){
            // Copy Template Data to Loc data
            Template = structuredClone(Template)
            for(let [key, value] of Object.entries(Template)){
                switch(true){
                    // TODO: add suffix keywords to do advanced functions (e.g. /_add_$/)
                    case original[key] === undefined: // if not in original object add it whole cloth 
                    default:
                        original[key] = value;
                        break;
                    case typeof value === "object": // if nested
                        Tree.Utilities.addDefaults(original[key], Template[key])
                        break;
                    case original[key] !== undefined:
                        break;
                }
            }
        },
        addDefaults_eventListeners: function(bud){
            // add Event Listeners
            if(bud.EventListeners == undefined){bud.EventListeners = []}

            for(let count = 0; count < bud.EventListeners.length; count++){
                // TODO! __CHILD__
                // Replaces keywords in "on"
                switch(true){
                    case /__SELF__/.test(bud.EventListeners[count].on):
                        bud.EventListeners[count].on = bud.EventListeners[count].on.replace("__SELF__", bud.Loc);
                        break;
                    case /__PARENT__/.test(bud.EventListeners[count].on):
                        bud.EventListeners[count].on = bud.EventListeners[count].on.replace("__PARENT__", bud.parentLoc);
                        break;
                }

                Tree.Utilities.eventlistenerAdd(
                    bud.EventListeners[count].type, 
                    bud.EventListeners[count].on,
                    bud.Loc,
                    bud.EventListeners[count].active,
                    bud.EventListeners[count].systems
                    );
            }
        },
        checkEnd: function(){
            // TODO! Maybe check out how many Locs of direct Children in a "graveyard" vs "entities"?
            //console.log("not yet I guess")
        },

        // Event Handling
        eventEmit: function(type, on, argJSON){
            let timing = Data.Time.frame < 1 ? 0 : performance.now() - Data.Time.PN_start;

            Data.EventQueue.push({type: type, on: on, timestamp: timing, arguments: argJSON});
        },
        eventlistenerAdd: function(type, on, Loc, active, ...systems){
            if(Data.EventListeners[`${type}_${on}`] !== undefined && Data.EventListeners[`${type}_${on}`].length > 0){
                // [TODO+1] use splice to position it in the correct location on the array instead of just pushing and then sorting
                Data.EventListeners[`${type}_${on}`].push({
                    Loc: Loc,
                    Active: active,
                    Systems: [...systems]
                })
                // sorting so that it'll go in order
                Data.EventListeners[`${type}_${on}`].sort((a, b) => {
                    const locA = a.Loc; 
                    const locB = b.Loc; 
                    if (locA < locB) {
                      return -1;
                    } else if (locA > locB) {
                      return 1;
                    } else {return 0};
                  })
            } else {
                Data.EventListeners[`${type}_${on}`] = [{
                    Loc: Loc,
                    Active: active,
                    Systems: [...systems]
                }];
            }
        },
        eventlistenerActivate: function(type, on, Loc){
            if(Data.EventListeners[`${type}_${on}`] !== undefined){
                Data.EventListeners[`${type}_${on}`].find(x => x.Loc == Loc).Active = true;
            } else {
                console.warn(`trying to activate the eventListener ${type}_${on} for ${Loc} but no eventListener exists`)
            }
        },
        eventlistenerDeactivate: function(type, on, Loc){
            if(Data.EventListeners[`${type}_${on}`] !== undefined){
                Data.EventListeners[`${type}_${on}`].find(x => x.Loc == Loc).Active = false;
            } else {
                console.warn(`trying to deactivate the eventListener ${type}_${on} for ${Loc} but no eventListener exists`)
            }
        },
        eventlistenerRemove: function(type, on, Loc){
            if(Data.EventListeners[`${type}_${on}`].length == 1){
                delete Data.EventListeners[`${type}_${on}`];
            } else {
                Data.EventListeners[`${type}_${on}`] = Data.EventListeners[`${type}_${on}`].filter(x => x.Loc !== Loc);
            }
        },

        // Getters (Specs + Date)
        getDate: function(format = 'ISO'){
            let todaysDate = new Date();
            let todaysDate_formatted = {
                Millisecond: `${todaysDate.getMilliseconds()}`,
                Second: todaysDate.getSeconds() < 10 ? `0${todaysDate.getSeconds()}` : `${todaysDate.getSeconds()}`,
                Minute: todaysDate.getMinutes() < 10 ? `0${todaysDate.getMinutes()}` : `${todaysDate.getMinutes()}`,
                Hour: todaysDate.getHours() < 10 ? `0${todaysDate.getHours()}` : `${todaysDate.getHours()}`,
                Day: todaysDate.getDate() < 10 ? `0${todaysDate.getDate()}` : `${todaysDate.getDate()}`,
                Month: todaysDate.getMonth() < 9 ? `0${todaysDate.getMonth()+1}` : `${todaysDate.getMonth()+1}`, // I hate that months are zero indexed but nothing else is...
                Year: `${todaysDate.getFullYear()}`,
            }
            switch(true){
                case todaysDate.getTimezoneOffset()>0:
                    todaysDate_formatted.timzoneOffset = todaysDate.getTimezoneOffset()/60 < 10 ? `-0${todaysDate.getTimezoneOffset()/60}` : `-${todaysDate.getTimezoneOffset()/60}`;
                    break;
                case todaysDate.getTimezoneOffset()<0:
                    todaysDate_formatted.timzoneOffset = -todaysDate.getTimezoneOffset()/60 < 10 ? `+0${-todaysDate.getTimezoneOffset()/60}` : `+${-todaysDate.getTimezoneOffset()/60}`;
                    break;
                case todaysDate.getTimezoneOffset()===0:
                    todaysDate_formatted.timzoneOffset = 'Z';
                    break;
            }
        
            return `${todaysDate_formatted.Year}-${todaysDate_formatted.Month}-${todaysDate_formatted.Day}T${todaysDate_formatted.Hour}${todaysDate_formatted.Minute}${todaysDate_formatted.Second}.${todaysDate_formatted.Millisecond}${todaysDate_formatted.timzoneOffset}`;
        },
        getURL: function(){
            let urlOUT = {};
            let url = new URL(window.location.href);

            urlOUT = {
                origin: url.origin,
                protocol: url.protocol,
                fullURL: url.href,
                pathname: url.pathname,
                port: url.port,
                search: url.search,
                searchParams: [],
            }

            url.searchParams.sort();
            let urlKeys = url.searchParams.keys();

            for (let key of urlKeys) {
                let val = url.searchParams.get(key);
                urlOUT.searchParams.push(
                    {
                        key: key,
                        value: val,
                    }
                )
            }

            return urlOUT;
        },
        getOS: function(){
            // Shamelessly stolen from https://dev.to/vaibhavkhulbe/get-os-details-from-the-webpage-in-javascript-b07
            var userAgent = window.navigator.userAgent,
            platform = window.navigator.platform,
            macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'],
            os = null;

            if (macosPlatforms.indexOf(platform) !== -1) {
              os = 'Mac OS';
            } else if (iosPlatforms.includes(platform)) {
              os = 'iOS';
            } else if (windowsPlatforms.indexOf(platform) !== -1) {
              os = 'Windows';
            } else if (/Android/.test(userAgent)) {
              os = 'Android';
            } else if (!os && /Linux/.test(platform)) {
              os = 'Linux';
            }
        
            return os;
        },
        getBrowser: function(){
            // mostly taken from https://www.seanmcp.com/articles/how-to-get-the-browser-version-in-javascript/
            // cleaned up chrome versioning number though
            let browserOUT = {
                browser: 'Other',
                version: 'N/A',
            };

            let userAgent = navigator.userAgent;

            if (userAgent.includes('Firefox/')) {
                //Firefox
                browserOUT.browser = 'Firefox';
                browserOUT.version = userAgent.split('Firefox/')[1];
            } else if (userAgent.includes('Edg/')) {
                // Edge (Chromium)
                browserOUT.browser = 'Edge';
                browserOUT.version = userAgent.split('Edg/')[1];
            } else if (userAgent.includes('Chrome/')) {
                // Chrome
                browserOUT.browser = 'Chrome';
                browserOUT.version =  userAgent.split('Chrome/')[1].split(' ')[0];
            } else if (userAgent.includes('Safari/')) {
                // Safari
                browserOUT.browser = 'Safari';
                browserOUT.version =  userAgent.split('Safari/')[1];
            } else {
                browserOUT.browser = 'Other';
                browserOUT.version = 'N/A';
            }

            return browserOUT;
        },
        getScreenInfo: function(){
            //TODO!
        }
    },

    DOM: {}
};

Data = {
    Tree: {},
    Settings: {},
    EventListeners: {},
    EventQueue: [],
    Time: {
        date: "",
        frame: 0,
        framesDropped: 0,
        frameTime_actual: 0,
        frameTime_ideal: 16.67,
        RAF_last: 0,
        RAF_current: 0,
        RAF_delta: 0,
        RAF_total: 0,
        PN_start: 0,
        PN_startAbsolute: 0,
        PN_current: 0,
        PN_total: 0,
        PN_totalAbsolute: 0,
        PN_totalRAFDelta: 0,
        log: [],
        log_mean: 0,
        log_sd: 0,
        logout: false,
    },
    Specs: {
        URL: "",
        OS: "",
        Browser: "",
        PIE_version: "0.0.1"
    },
    Results : [],
    Storage: {
        id: Tree.Utilities.uuid()
    }
};