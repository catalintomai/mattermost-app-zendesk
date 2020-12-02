import {AppBinding, AppState, AppsState} from 'mattermost-redux/types/apps';

class Bindings {
    // getBindings returns bindings defined for all locations in the app
    getBindings(): AppState {
        const state: AppsState = [
            this.postMenuBindings(),
            this.channelHeaderBindings(),
        ];
        return state;
    }

    // postMenuBindings returns bindings for the post_menu location
    postMenuBindings(): AppBinding {
        const binding: AppBinding = {
            location_id: '/post_menu',
            bindings: [
                {
                    label: 'Create Zendesk Ticket',
                    description: 'Create ticket in zendesk',
                    icon: 'https://raw.githubusercontent.com/jfrerich/mattermost-applet-zendesk/initial-PR/assets/zendesk.svg',
                    call: {
                        url: 'https://jasonf.ngrok.io/createticket',
                        type: 'form',
                        expand: {
                            app: '',
                            post: 'All',
                        },
                    },
                },
            ],
        };
        return binding;
    }

    // channelHeaderBindings returns bindings for the channel_header location
    channelHeaderBindings(): AppBinding {
        const binding: AppBinding = {
            location_id: '/channel_header',
            bindings: [
                {
                    label: 'Manage Zendesk Subscriptions',
                    description: 'Create ticket in zendesk',
                    icon: 'https://raw.githubusercontent.com/jfrerich/mattermost-applet-zendesk/initial-PR/assets/zendesk.svg',
                    call: {
                        url: 'https://jasonf.ngrok.io/subscribe',
                        type: 'form',
                        expand: {
                            app: '',
                            post: 'All',
                        },
                    },
                },
            ],
        };
        return binding;
    }
}

export default new Bindings();
