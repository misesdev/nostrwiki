"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
class DBElastic {
    constructor(client = new elasticsearch_1.Client({
        node: process.env.ELASTIC_URL // 'http://localhost:9200' 
    })) {
        this._client = client;
    }
    /**
     * Indexa notas em batch usando a API bulk
     */
    indexNotes(notes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!notes.length)
                return;
            const body = notes.flatMap(note => [
                { index: { _index: 'notes', _id: note.id } },
                {
                    id: note.id,
                    pubkey: note.pubkey,
                    title: note.title,
                    content: note.content,
                    published_by: note.published_by,
                    published_at: note.published_at,
                    tags: note.tags
                }
            ]);
            const bulkResponse = yield this._client.bulk({ body });
            if (bulkResponse.errors) {
                const erroredDocuments = [];
                bulkResponse.items.forEach((action, i) => {
                    const operation = Object.keys(action)[0];
                    if (action[operation].error) {
                        erroredDocuments.push({
                            status: action[operation].status,
                            error: action[operation].error,
                            document: notes[i]
                        });
                    }
                });
                if (erroredDocuments.length) {
                    console.error('Erros when indexing notes:', erroredDocuments);
                }
            }
        });
    }
    /**
     * Indexa usuários em batch usando a API bulk
     */
    indexUsers(users) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!users.length)
                return;
            const body = users.flatMap(user => [
                { index: { _index: 'users', _id: user.pubkey } },
                {
                    name: user.name,
                    pubkey: user.pubkey,
                    display_name: user.display_name,
                    about: user.about,
                    pucture: user.picture,
                    banner: user.banner
                }
            ]);
            const bulkResponse = yield this._client.bulk({ body });
            if (bulkResponse.errors) {
                const erroredDocuments = [];
                bulkResponse.items.forEach((action, i) => {
                    const operation = Object.keys(action)[0];
                    if (action[operation].error) {
                        erroredDocuments.push({
                            status: action[operation].status,
                            error: action[operation].error,
                            document: users[i]
                        });
                    }
                });
                if (erroredDocuments.length) {
                    console.error('Error when indexing users:', erroredDocuments);
                }
            }
        });
    }
}
exports.default = DBElastic;
