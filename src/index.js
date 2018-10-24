import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
    render() {
        if (this.props.value === 0) {
            return (
                <span className="square" contentEditable onInput={this.emitChange.bind(this)}></span>
            );
        }
        else {
            return (
                <span className="square">
                    {this.props.value}
                </span>
            );
        }
    }

    emitChange() {
        var row = Math.floor(this.props.id / 10);
        var col = this.props.id - (row * 10);
        fetch("http://localhost:8090/api/check", {
            method: 'POST',
            body: {
                rows: this.props.rows
            }
        }).then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    console.log(error);
                }
            )
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            rows: []
        };
    }

    componentDidMount() {
        fetch("http://localhost:8090/api/generate")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        rows: result
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    renderSquare(key, value) {
        return <Square key={key} id={key} value={value} rows={this.state.rows} />;
    }

    render() {
        const { error, isLoaded, rows } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div>
                    {
                        rows.map((cols, rowIndex) => (
                            <div key={rowIndex} className="board-row">
                                {
                                    cols.map((cell, colIndex) => (
                                        this.renderSquare((rowIndex + 1) * 10 + colIndex + 1, cell)
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
            );
        }
    }
}

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
