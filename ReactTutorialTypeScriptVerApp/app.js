/// <reference path="typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var data = [
    { author: "Pete Hunt", text: "This is one comment" },
    { author: "Jordan Wakle", text: "This is *another* comment" }
];
var CommentItem = (function (_super) {
    __extends(CommentItem, _super);
    function CommentItem() {
        _super.apply(this, arguments);
    }
    CommentItem.prototype.render = function () {
        var rawMarkup = marked(this.props.children.toString());
        return React.createElement("div", {"className": "commentItem"}, React.createElement("h2", {"className": "commentAuthor"}, this.props.author), React.createElement("span", {"dangerouslySetInnerHTML": { __html: rawMarkup }}));
    };
    return CommentItem;
})(React.Component);
var CommentList = (function (_super) {
    __extends(CommentList, _super);
    function CommentList() {
        _super.apply(this, arguments);
    }
    CommentList.prototype.render = function () {
        var commentNodes = this.props.data.map(function (x) { return React.createElement(CommentItem, {"author": x.author}, x.text); });
        return React.createElement("div", {"className": "commentList"}, commentNodes);
    };
    return CommentList;
})(React.Component);
var CommentForm = (function (_super) {
    __extends(CommentForm, _super);
    function CommentForm() {
        _super.apply(this, arguments);
    }
    CommentForm.prototype.handleSubmit = function (e) {
        e.preventDefault();
        var author = ReactDOM.findDOMNode(this.refs["author"]).value.trim();
        var text = ReactDOM.findDOMNode(this.refs["text"]).value.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({ author: author, text: text });
        ReactDOM.findDOMNode(this.refs["author"]).value = "";
        ReactDOM.findDOMNode(this.refs["text"]).value = "";
        return;
    };
    CommentForm.prototype.render = function () {
        return React.createElement("form", {"className": "commentForm", "onSubmit": this.handleSubmit.bind(this)}, React.createElement("input", {"type": "text", "placeholder": "your name", "ref": "author"}), React.createElement("input", {"type": "text", "placeholder": "Say something...", "ref": "text"}), React.createElement("input", {"type": "submit", "value": "Post"}));
    };
    return CommentForm;
})(React.Component);
var CommentBox = (function (_super) {
    __extends(CommentBox, _super);
    function CommentBox(props) {
        _super.call(this, props);
        this.state = { data: [] };
    }
    CommentBox.prototype.loadCommentsFromServer = function () {
        var _this = this;
        $.ajax({
            url: this.props.url,
            dataType: "json",
            cache: false,
            success: (function (data) { return _this.setState({ data: data }); }).bind(this),
            error: (function (xhr, status, err) { return console.error(_this.props.url, status, err.toString()); }).bind(this)
        });
    };
    CommentBox.prototype.handleCommentSubmit = function (comment) {
        var _this = this;
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({ data: newComments });
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(comment),
            success: (function (data) { return _this.setState({ data: data }); }).bind(this),
            error: (function (xhr, status, err) {
                _this.setState({ data: comments });
                console.error(_this.props.url, status, err.toString());
            }).bind(this)
        });
    };
    CommentBox.prototype.componentDidMount = function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer.bind(this), this.props.poolInterval);
    };
    CommentBox.prototype.render = function () {
        return React.createElement("div", {"className": "commentBox"}, React.createElement("h1", null, "Comments"), React.createElement(CommentList, {"data": this.state.data}), React.createElement(CommentForm, {"onCommentSubmit": this.handleCommentSubmit.bind(this)}));
    };
    return CommentBox;
})(React.Component);
ReactDOM.render(React.createElement(CommentBox, {"url": "api/comments.json", "poolInterval": 2000}), document.getElementById("content"));
//# sourceMappingURL=app.js.map