import {Post} from 'mattermost-redux/types/posts';
import {AppCall, AppState, AppCallResponse, AppCallValues} from 'mattermost-redux/types/apps';
import {Tickets, CreatePayload} from 'node-zendesk';

import mmClient from '../mattermost/client';
import zendeskClient from '../zendesk/client';

import manifest from '../../manifest';

import bindings from './bindings';
import calls from './calls';
import store from './store';

const username = process.env.ZENDESK_USERNAME as string;
const token = process.env.ZENDESK_API_TOKEN as string;
const apiURL = process.env.ZENDESK_URL + '/api/v2' as string;

class App {
    bindings: typeof AppState;
    calls: typeof AppCallResponse;
    manifest: typeof any;

    constructor() {
        this.bindings = bindings;
        this.calls = calls;
        this.manifest = manifest;
    }

    async createTicketFromPost(appCall: AppCall): string {
        const ticket = this.getTicketForPost(appCall.values);

        const zdClient = zendeskClient(username, token, apiURL);
        const result = await zdClient.tickets.create(ticket);
        const user = await zdClient.users.show(result.requester_id);
        const host = process.env.ZENDESK_URL;
        const message = `${user.name} created ticket [#${result.id}](${host}/agent/tickets/${result.id}) [${result.subject}]`;
        zdClient.targets.create();

        await this.createBotPost(appCall.context, message);
        return message;
    }

    async createBotPost(context: AppContext, message: string) {
        const client = mmClient;
        client.setToken(store.getBotAccessToken());

        const post: Post = {
            message,
            channel_id: context.channel_id,
            root_id: context.post_id,
        };
        const pRes = client.createPost(post);
    }

    getTicketForPost(values: AppCallValues): CreatePayload {
        const mmSignature = '*message created from Mattermost message.*\n';

        const zdMessage = values.additional_message + '\n' +
            values.post_message + '\n' +
            mmSignature;

        const ticket: Tickets.CreatePayload = {
            ticket: {
                subject: values.subject,
                type: values.type,
                priority: values.priority,
                comment: {
                    body: zdMessage,
                },
            },
        };
        return ticket;
    }

    async createSubscription(appCall: AppCall): string {
        const channelId: string = appCall.context.channel_id;
        const teamId: string = appCall.context.team_id;

        const zdClient = zendeskClient(username, token, apiURL);

        // const title = `MM_${channelId}_${teamId}`;
        // const target: any = {
        //     target: {
        //         type: 'http_target',
        //         title,
        //         active: true,
        //         method: 'post',
        //         content_type: 'application/json',
        //         target_url: 'https://jasonf.ngrok.io/zendesk/webhook',
        //     },
        // };
        //
        // await zdClient.targets.create(target, (result) => {
        //     console.log('result= ', result);
        // });

        // const trigger = {
        //     trigger: {
        //         title: 'Roger Wilco',
        //         all: [
        //             {field: 'status', operator: 'is', value: 'open'},
        //             {field: 'priority', operator: 'less_than', value: 'high'},
        //         ],
        //         actions: [
        //             {field: 'group_id', value: '20455932'},
        //         ],
        //     },
        // };

        await zdClient.targets.list().
            then((result) => {
                console.log('result= ', result);
            }).
            catch((error) => {
                console.log('error = ', error);
            });

        const trigger: any = {
            trigger: {
                title: 'jason',

                //         description: appCall.values.subject,
                //         active: true,
                all: [
                    {field: 'ticket', operator: 'is', value: 'created'},
                ],
                actions: [
                    {field: 'group_id', value: '20455932'},
                ],
            },
        };

        await zdClient.triggers.list().
            then((result) => {
                console.log('result= ', result);
            }).
            catch((error) => {
                console.log('error = ', error);
            });

        // const result = zdClient.triggers.list((result) => {
        //     console.log('1. result= ', result);
        // });
        // console.log('2. result = ', result);

        await zdClient.triggers.create(trigger, (result) => {
            console.log('result= ', result);
        });

        return '';
    }
}

export default new App();
