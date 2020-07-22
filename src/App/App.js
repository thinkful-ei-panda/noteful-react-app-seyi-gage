import React, {Component} from 'react';
import {Route, Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import {getNotesForFolder, findNote, findFolder} from '../notes-helpers';
import './App.css';
import config from '../config'

class App extends Component {
    state = {
        notes: [],
        folders: []
    };

    get = () => {
        Promise.all([
                fetch(`${config.API_ENDPOINT}/notes`,{
                    method : 'GET',
                    headers : {
                        'content-type' : 'application/json',
                        'Authorization' : `Bearer ${config.API_TOKEN}`
                    }
                }),
                fetch(`${config.API_ENDPOINT}/folders`,{
                    method : 'GET',
                    headers : {
                        'content-type' : 'application/json',
                        'Authorization' : `Bearer ${config.API_TOKEN}`
                    },
                }),
            ])
                .then(([notesRes, foldersRes]) => {
                    if (!notesRes.ok)
                        return notesRes.json().then((e) => Promise.reject(e))
                    if (!foldersRes.ok)
                        return foldersRes.json().then((e) => Promise.reject(e))
    
                    return Promise.all([notesRes.json(), foldersRes.json()])
                })
                .then(([notes, folders]) => {
                    this.setState({ notes, folders })
                })
                .catch((error) => {
                    console.error({ error })
                })
    }

    componentDidMount() {
        this.get();     
    }

    renderNavRoutes() {
        const {notes, folders} = this.state;
        console.log(this.state)
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => (
                            <NoteListNav
                                folders={folders}
                                notes={notes}
                                {...routeProps}
                            />
                        )}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId) || {};
                        const folder = findFolder(folders, note.folderId);
                        return <NotePageNav {...routeProps} folder={folder} />;
                    }}
                />
                <Route path="/add-folder" component={NotePageNav} />
                <Route path="/add-note" component={NotePageNav} />
            </>
        );
    }

    renderMainRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => {
                            const {folderId} = routeProps.match.params;
                            const notesForFolder = getNotesForFolder(
                                notes,
                                folderId
                            );
                            return (
                                <NoteListMain
                                    {...routeProps}
                                    notes={notesForFolder}
                                />
                            );
                        }}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId);
                        return <NotePageMain {...routeProps} note={note} />;
                    }}
                />
            </>
        );
    }

    render() {
        return (
            <div className="App">
                <nav className="App__nav">{this.renderNavRoutes()}</nav>
                <header className="App__header">
                    <h1>
                        <Link to="/">Noteful</Link>{' '}
                        <FontAwesomeIcon icon="check-double" />
                    </h1>
                </header>
                <main className="App__main">{this.renderMainRoutes()}</main>
            </div>
        );
    }
}

export default App;
