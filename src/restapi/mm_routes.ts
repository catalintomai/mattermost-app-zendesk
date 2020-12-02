import fs from 'fs';

import express, {Request, Response} from 'express';
import {AppCall} from 'mattermost-redux/types/apps';

import app from '../app/app';

import {jsonStoreFileName} from '../app/constants';

const router = express.Router();

router.post('/createticket', async (req: Request, res: Response) => {
    const appCall: AppCall = req.body;
    if (appCall.type === 'form') {
        const form = app.calls.createTicket(appCall.context.post.message);
        res.json(form);
    } else {
        const message = app.createTicketFromPost(appCall);
        res.json({});
    }
});

router.post('/subscribe', async (req: Request, res: Response) => {
    const appCall: AppCall = req.body;
    if (appCall.type === 'form') {
        const form = app.calls.subscribeForm();
        res.json(form);
    } else {
        const message = app.createSubscription(appCall);
        res.json({});
    }
});

router.get('/manifest.json', (req: Request, res: Response) => {
    res.json(app.manifest);
});

router.get('/bindings', (req: Request, res: Response) => {
    res.json(app.bindings.getBindings());
});

router.post('/install', (req: Request, res: Response) => {
    // Write json file store
    fs.writeFile(jsonStoreFileName, JSON.stringify(req.body.values), 'utf8', (err) => {
        if (err) {
            console.log(err);
            res.statusMessage = 'unable to write json storage file';
            res.status(400).end();
        } else {
            console.log(jsonStoreFileName, ' successfully written');
            res.sendStatus(200);
        }
    });
});

router.post('/oauth2/complete', (req: Request, res: Response) => {
    res.send('hello');
});

export default router;
