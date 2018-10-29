import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';

class Square extends React.Component {
    render() {
        if (this.props.color === 'red') {
            return (
                <span className="square square-error" contentEditable onInput={this.emitChange.bind(this)}></span>
            );
        } else {
            if (this.props.value === 0) {
                return (
                    <span className="square" contentEditable onInput={this.emitChange.bind(this)}></span>
                );
            }
            else {
                if (this.props.color === 'green') {
                    return (
                        <span className="square square-ok" contentEditable onInput={this.emitChange.bind(this)}></span>
                    );
                } else {
                    return (
                        <span className="square square-default">
                            {this.props.value}
                        </span>
                    );
                }
            }
        }
    }

    emitChange(event) {
        var input = event.target;
        this.props.onChange(this.props.id, input.textContent);
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            rows: [],
            colors: []
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

    handleClick(key, val) {
        const updatedRows = this.state.rows.slice();
        const colors = this.state.colors.slice();
        var row = Math.floor(key / 10);
        var col = (key - (row * 10));
        row--; col--;
        if (val < 1 || val > 9) {
            colors[key] = "red";
            this.setState({ rows: updatedRows, colors: colors });
        } else {
            axios.post('http://localhost:8090/api/check', {
                matrix: updatedRows,
                "row": row,
                "col": col,
                "num": val
            })
                .then((response) => {
                    if (response.data) {
                        updatedRows[row][col] = parseInt(val);
                        colors[key] = "green";
                    } else {
                        updatedRows[row][col] = 0;
                        colors[key] = "red";
                    }
                    this.setState({ rows: updatedRows, colors: colors });
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    renderSquare(key, value) {
        let color = this.state.colors[key];
        return <Square key={key} id={key} value={value} color={color} rows={this.state.rows} onChange={(key, value) => this.handleClick(key, value)} />;
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
