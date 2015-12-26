/// <reference path="typings/tsd.d.ts" />

interface Data {
    author: string;
    text: string;
}

var data: Data[] = [
    { author: "Pete Hunt", text: "This is one comment" },
    { author: "Jordan Wakle", text: "This is *another* comment" }
];


interface CommentItemProps extends React.Props<any> {
    author: string;
}

class CommentItem extends React.Component<CommentItemProps, any> {
    render() {
        var rawMarkup = marked(this.props.children.toString());
        return <div className="commentItem">
                <h2 className="commentAuthor">{this.props.author}</h2>
                <span dangerouslySetInnerHTML={{ __html: rawMarkup }}></span>
            </div>;
    }
}

interface CommentListProps extends React.Props<any> {
    data: Data[];
}

class CommentList extends React.Component<CommentListProps, any> {
    render() {
        var commentNodes = this.props.data.map(x => <CommentItem author={x.author}>{x.text}</CommentItem>);
        return <div className="commentList">
                {commentNodes}
            </div>;
    }
}

interface CommentFormProps extends React.Props<any> {
    onCommentSubmit: (data: Data) => void;
}

class CommentForm extends React.Component<CommentFormProps, any> {
    private handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        var author = (ReactDOM.findDOMNode(this.refs["author"]) as HTMLInputElement).value.trim();
        var text = (ReactDOM.findDOMNode(this.refs["text"]) as HTMLInputElement).value.trim();

        if (!text || !author) {
            return;
        }

        this.props.onCommentSubmit({ author: author, text: text } as Data);
        (ReactDOM.findDOMNode(this.refs["author"]) as HTMLInputElement).value = "";
        (ReactDOM.findDOMNode(this.refs["text"]) as HTMLInputElement).value = "";
        return;
    }

    render() {
        return <form className="commentForm" onSubmit={this.handleSubmit.bind(this) }>
                <input type="text" placeholder="your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
            </form>;
    }
}

interface CommentBoxProps extends React.Props<any> {
    url: string;
    poolInterval: number;
}

interface CommentBoxState {
    data: Data[];
}

class CommentBox extends React.Component<CommentBoxProps, CommentBoxState> {
    constructor(props: CommentBoxProps) {
        super(props);
        this.state = { data: [] };
    }

    private loadCommentsFromServer() {
        $.ajax({
            url: this.props.url,
            dataType: "json",
            cache: false,
            success: (data => this.setState({ data: data } as CommentBoxState)).bind(this),
            error: ((xhr, status, err) => console.error(this.props.url, status, err.toString())).bind(this)
        });
    }

    private handleCommentSubmit(comment: Data) {
        var comments = this.state.data;
        var newComments = comments.concat([comment]);
        this.setState({ data: newComments } as CommentBoxState);
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(comment),
            success: (data => this.setState({ data: data } as CommentBoxState)).bind(this),
            error: ((xhr, status, err) => {
                this.setState({ data: comments } as CommentBoxState);
                console.error(this.props.url, status, err.toString());
            }).bind(this)
        });
    }

    componentDidMount() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer.bind(this), this.props.poolInterval);
    }

    render() {
        return <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit.bind(this)} />
            </div>;
    }
}

ReactDOM.render(
    <CommentBox url="api/comments.json" poolInterval={2000} />,
    document.getElementById("content"));