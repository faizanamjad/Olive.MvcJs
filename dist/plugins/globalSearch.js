define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(input) {
            this.input = input;
            this.awaitingAutocompleteResponses = 0;
            this.testvarable = 3;
            this.isMouseInsideSearchPanel = false;
            this.isTyping = false;
            this.searchedText = null;
        }
        GlobalSearch.enable = function (selector) {
            selector.each(function (i, e) { return new GlobalSearch($(e)).enable(); });
        };
        GlobalSearch.boldSearch = function (str, searchText) {
            var ix = -1;
            var result = "";
            if (str !== null && str !== undefined) {
                str = str
                    .replace(/<strong>/gi, '↨↨').replace(/<\/strong>/gi, '↑↑');
                var strlower = str.toLowerCase();
                if (searchText !== "" && searchText !== null && searchText !== undefined) {
                    var stxt = searchText.toLowerCase();
                    do {
                        var ix_next = strlower.indexOf(stxt, ix);
                        if (ix_next < 0)
                            break;
                        if (ix < 0)
                            result = str.substr(0, ix_next);
                        result += (ix >= 0 ? str.substr(ix, ix_next - ix) : "") + "<strong>" + str.substr(ix_next, stxt.length) + "</strong>";
                        ix = ix_next + stxt.length;
                    } while (true);
                }
                result += (ix < 0 ? str : str.substr(ix, str.length - ix));
                result = result
                    .replace(/↨↨/gi, '<strong>').replace(/↑↑/gi, '</strong>');
            }
            return result;
        };
        GlobalSearch.boldSearchAll = function (str, searchText) {
            var result = str;
            if (searchText != null && searchText != undefined) {
                var splitedsearchtext = searchText.split(' ');
                for (var _i = 0, splitedsearchtext_1 = splitedsearchtext; _i < splitedsearchtext_1.length; _i++) {
                    var strST = splitedsearchtext_1[_i];
                    result = this.boldSearch(result, strST);
                }
            }
            return result;
        };
        GlobalSearch.prototype.enable = function () {
            if (this.input.is("[data-globalsearch-enabled=true]"))
                return;
            else
                this.input.attr("data-globalsearch-enabled", "true");
            this.input.wrap("<div class='global-search-panel'></div>");
            var urlsList = (this.input.attr("data-search-source") || '').split(";");
            this.urlList = urlsList;
            var timeout = null;
            this.input.keyup((function (e) {
                this.isTyping = true;
                clearTimeout(timeout);
                timeout = setTimeout((function () {
                    this.isTyping = false;
                    if (this.searchedText != this.input.val().trim()) {
                        this.createSearchComponent(this.urlList);
                    }
                }).bind(this), 300);
            }).bind(this));
            this.input.on("blur", (function (e) {
                if (this.isMouseInsideSearchPanel === false) {
                    this.clearSearchComponent();
                }
            }).bind(this));
        };
        GlobalSearch.prototype.inputChangeHandler = function () {
            this.createSearchComponent(this.urlList);
        };
        GlobalSearch.prototype.clearSearchComponent = function () {
            var inputholder = this.input.parent();
            if (inputholder !== undefined) {
                var panel = inputholder.find(".global-search-result-panel");
                if (panel !== undefined) {
                    panel.empty();
                    panel.remove();
                }
            }
        };
        GlobalSearch.prototype.createSearchComponent = function (urls) {
            var _this = this;
            this.searchedText = this.input.val().trim();
            var searchPanel = this.input.parent();
            var resultPanel = searchPanel.find(".global-search-result-panel");
            if (resultPanel == undefined || resultPanel == null || resultPanel.length == 0) {
                resultPanel = $("<div class='global-search-result-panel'>")
                    .mouseenter(function () { return _this.isMouseInsideSearchPanel = true; })
                    .mouseleave(function () { return _this.isMouseInsideSearchPanel = false; });
                searchPanel.append(resultPanel);
            }
            resultPanel.empty();
            var beginSearchStarted = true;
            var searchHolder = $("<div class='search-container'>");
            // loading icon
            if ($(".global-search-panel .loading-div").length > 0) {
                $(".global-search-panel .loading-div").empty();
                $(".global-search-panel .loading-div").remove();
            }
            $(".global-search-panel").append($("<div class='loading-div'>")
                .append($("<i class= 'loading-icon fa fa-spinner fa-spin' > </i><div>")));
            var ajaxlist = urls.map(function (p) {
                var icon = p.split("#")[1].trim();
                return {
                    url: p.split("#")[0].trim(),
                    icon: icon,
                    globalsearchRef: _this,
                    text: _this.searchedText,
                    state: 0,
                    ajx: {},
                    displayMessage: "",
                    result: [{
                            Title: "",
                            Description: "",
                            IconUrl: "",
                            Url: ""
                        }],
                    template: jQuery
                };
            });
            var resultcount = 0;
            for (var _i = 0, ajaxlist_1 = ajaxlist; _i < ajaxlist_1.length; _i++) {
                var tempobj = ajaxlist_1[_i];
                tempobj.ajx = $
                    .ajax({
                    dataType: "json",
                    url: tempobj.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    // additional data to be send 
                    data: { searcher: tempobj.text },
                    // if succesfully respond, this callback will be called
                    success: (function (result) {
                        var tpobj = this;
                        if (tpobj.globalsearchRef.isTyping == false) {
                            tpobj.result = result;
                            if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                                tpobj.state = 1; // 1 -> success                           
                                // filter in client side                           
                                var resultfiltered = result.filter(function (p) {
                                    var resfilter = false;
                                    if (tpobj.text != null && tpobj.text != undefined && tpobj.text !== '') {
                                        var arfilter = tpobj.text.split(' ');
                                        for (var _i = 0, arfilter_1 = arfilter; _i < arfilter_1.length; _i++) {
                                            var strfilter = arfilter_1[_i];
                                            if (((p.Description !== null && p.Description !== undefined && p.Description.match(new RegExp(strfilter, 'gi')) != null) || p.Title.match(new RegExp(strfilter, 'gi')) != null)) {
                                                resfilter = true;
                                                break;
                                            }
                                        }
                                    }
                                    else {
                                        resfilter = true;
                                    }
                                    return resfilter;
                                });
                                var searchItem = $("<div class='search-item'>");
                                var groupTitle = tpobj.url.split(".")[0].replace("https://", "").replace("http://", "").toUpperCase();
                                var searhTitle = $("<div class='search-title'>").append($("<i>").attr("class", tpobj.icon)).append(groupTitle);
                                searchItem.append(searhTitle);
                                var childrenItems = $("<ul>");
                                for (var i = 0; i < resultfiltered.length && i < 10; i++) {
                                    resultcount++;
                                    var item = resultfiltered[i];
                                    childrenItems.append($("<li>")
                                        .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>")))
                                        .append($("<a href='" + item.Url + "'>")
                                        .html(GlobalSearch.boldSearchAll(item.Title, tpobj.text)))
                                        .append($(" <div class='desc'>").html(item.Description)));
                                }
                                searchItem.append(childrenItems);
                                if (resultfiltered.length === 0)
                                    searchItem.addClass("d-none");
                                searchHolder.append(searchItem);
                                if (beginSearchStarted && resultfiltered.length > 0) {
                                    beginSearchStarted = false;
                                    resultPanel.append(searchHolder);
                                }
                            }
                            else {
                                tpobj.state = 2; // 2 -> fail
                                console.log("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                            }
                        }
                    }).bind(tempobj)
                })
                    // if failed to get data run this callback
                    .fail((function (e) {
                    var tpobj = this;
                    tpobj.state = 2;
                    var ulFail = $("<ul>");
                    ulFail.append($("<li>").append($("<span>").html('ajax failed Loading data from source [' + tpobj.url + ']')));
                    resultPanel.append(ulFail);
                    console.log('ajax failed Loading data from source [' + tpobj.url + ']');
                    console.log(e);
                }).bind(tempobj))
                    // use this callback to check whether all ajax requests, finished
                    .always((function () {
                    var tpobj = this;
                    console.log('always event raised for: ' + tpobj.url);
                    // check all ajax finished            
                    if (ajaxlist.filter(function (p) { return p.state === 0; }).length === 0) {
                        console.log('All ajax completed');
                        $(".global-search-panel .loading-div").empty();
                        $(".global-search-panel .loading-div").remove();
                        if (resultcount === 0) {
                            console.log("Found nothing");
                            var ulNothing = $("<ul>");
                            ulNothing.append("<li>").append("<span>").html('Nothing found');
                            resultPanel.append(ulNothing);
                        }
                        else {
                            console.log('Total Found: ' + resultcount);
                        }
                    }
                }).bind(tempobj));
                console.log('ajax send to: ' + tempobj.url);
            }
        };
        GlobalSearch.prototype.clearValue = function () {
            if (this.input.val() === "")
                this.valueField.val("");
            if (this.input.val() !== this.input.data("selected-text"))
                this.valueField.val("");
        };
        GlobalSearch.prototype.itemSelected = function (item) {
            if (item != undefined) {
                this.valueField.val(item.Value);
                this.input.data("selected-text", item.Display);
                this.input.val(item.Display);
            }
            else {
                console.log("Clearing text, item is undefined");
                this.input.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
            this.input.trigger("change");
        };
        // Convert current form array to simple plain object
        GlobalSearch.prototype.toObject = function (arr) {
            var rv = {};
            for (var i = 0; i < arr.length; ++i)
                rv[arr[i].name] = arr[i].value;
            return rv;
        };
        return GlobalSearch;
    }());
    exports.default = GlobalSearch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQ0E7UUFpREksc0JBQW9CLEtBQWE7WUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBaER6QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFFMUMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFFeEIsNkJBQXdCLEdBQVksS0FBSyxDQUFDO1lBQzFDLGFBQVEsR0FBWSxLQUFLLENBQUM7WUFDMUIsaUJBQVksR0FBVyxJQUFJLENBQUM7UUEwQ0MsQ0FBQztRQXhDeEIsbUJBQU0sR0FBcEIsVUFBcUIsUUFBZ0I7WUFDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFYyx1QkFBVSxHQUF6QixVQUEwQixHQUFXLEVBQUUsVUFBa0I7WUFDckQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7WUFDeEIsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7Z0JBQ25DLEdBQUcsR0FBRyxHQUFHO3FCQUNKLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLFVBQVUsS0FBSyxFQUFFLElBQUksVUFBVSxLQUFLLElBQUksSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUN0RSxJQUFJLElBQUksR0FBRyxVQUFVLENB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