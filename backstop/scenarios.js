const DOMAIN = process.env.DOMAIN || 'localhost';

const composeScenario = (...args) => Object.assign({}, ...args);
const contentOnly = composeScenario.bind(null, {
    selectors: ['.content-wrapper'],
});

// env or config file?
const PAGE_IDS = [
    1, 11, 7, 10,
    258, 486, 528, 498,
    12, 490, 339, 546,
    115, 237, 541, 3, 
    405, 200, 4, 477,
    177, 5, 542, 288,
    287, 544
]

const generateLabels = (scenario, index) => {
    let fullLabel = scenario.path;

    if (scenario.typeSelector) {
        if (Array.isArray(scenario.typeSelector)) {
            fullLabel += ` ${scenario.typeSelector.join(', ')}`;
        } else {
            fullLabel += ` ${scenario.typeSelector}`;
        }
    }

    if (scenario.clickSelector) {
        if (Array.isArray(scenario.clickSelector)) {
            fullLabel += ` ${scenario.clickSelector.join(', ')}`;
        } else {
            fullLabel += ` ${scenario.clickSelector}`;
        }
    }

    const label = fullLabel.substring(0, 100);

    return {
        index,
        label,
        fullLabel,
    };
};


const generateScenario = (scenario, index) => {

    return Object.assign(
        {
            url: `http://${DOMAIN}/admin${scenario.path}`,
            misMatchThreshold: 0.05,
            hideSelectors: [
                // Relative dates are dynamic, thus likely to break tests.
                // '.human-readable-date'
            ],
            onBeforeScript: 'onBefore.js',
            onReadyScript: 'onReady.js',
            cookies: {
                sessionid: process.env.WAGTAIL_SESSIONID,
            },
        },
        generateLabels(scenario, index),
        scenario,
    );
};

const empty = [
    { label: 'Empty 1', path: '/empty', selectors: ['.page404__button'] },
    { label: 'Empty 2', path: '/empty', selectors: ['.page404__button'] },
    { label: 'Empty 3', path: '/empty', selectors: ['.page404__button'] },
    { label: 'Empty 4', path: '/empty', selectors: ['.page404__button'] },
    { label: 'Empty 5', path: '/empty', selectors: ['.page404__button'] },
    { label: 'Empty 6', path: '/empty', selectors: ['.page404__button'] },
];

const base = [
    { path: '/login', onBeforeScript: null },
    // No way to disable JavaScript with Chromy at the moment.
    // { path: '/', label: 'No JS', onBeforeScript: 'disableJS.js' },
    { path: '/', selectors: ['.nav-wrapper', '.content-wrapper'] },
    { path: '/404' },
    contentOnly({ path: '/styleguide/' }),
    // Revokes the session cookie, which is annoying when testing.
    // { path: '/logout' },
    // Loading spinner always makes the test fail.
    // { path: '/pages/preview' },
    // TODO Add edit bird.
];

const nav = [
    {
        path: '/',
        selectors: ['.nav-wrapper'],
        clickSelector: '#account-settings',
    },
    {
        path: '/',
        clickSelector: '.submenu-trigger.icon-cogs',
    },
    {
        path: '/',
        clickSelector: '.submenu-trigger.icon-fa-cutlery',
    },
    {
        path: '/',
        clickSelector: '[data-explorer-menu-item] > a',
    },
    {
        path: '/',
        clickSelector: [
            '[data-explorer-menu-item] > a',
            '.c-explorer__item__action:last-of-type',
        ],
        onReadySelector: '.c-explorer__item:nth-child(2)',
    },
];

function flatten(arr) {
    return Array.prototype.concat(...arr);
}

const generatePages = () => {
    let pages = [
        contentOnly({ path: '/pages/' }),
        contentOnly({ path: '/pages/search/?q=club' }),
        contentOnly({ path: '/pages/search/?q=12345' }),
    ]

    PAGE_IDS.forEach(function (pageID) {
        let page = [
            {
                path: `/pages/${pageID}/`,
            },
            {
                path: `/pages/${pageID}/edit/`,
            },
            contentOnly({ path: `/pages/${pageID}/?ordering=ord` }),
            contentOnly({ path: `/pages/${pageID}/revisions/` }),
            contentOnly({ path: `/pages/${pageID}/unpublish/` }),
            contentOnly({ path: `/pages/${pageID}/delete/` }),
            contentOnly({ path: `/pages/${pageID}/copy/` }),
            contentOnly({ path: `/pages/${pageID}/add_subpage/` }),
        ]
        pages.push(page);
    });

    pages = flatten(pages);

    return {
        pages,
    };
}

const generateRichText = () => {
    let richtext = []

    PAGE_IDS.forEach(function(pageID) {
        let pageRichText = [
            {
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="header_two"]',
                selectors: ['.widget-draftail_rich_text_area'],
            },
            {
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="ordered-list-item"]',
                selectors: ['.widget-draftail_rich_text_area'],
            },
            {
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="unordered-list-item"]',
                selectors: ['.widget-draftail_rich_text_area'],
            },
            {
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="HORIZONTAL_RULE"]',
                selectors: ['.widget-draftail_rich_text_area'],
            },
            {
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: ['[name="HORIZONTAL_RULE"]', '[name="undo"]'],
                selectors: ['.widget-draftail_rich_text_area'],
            },
            contentOnly({
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="EMBED"]',
                onReadySelector: '[action="/admin/embeds/chooser/upload/"]',
            }),
            contentOnly({
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="DOCUMENT"]',
                onReadySelector: '[action="/admin/documents/chooser/"]',
            }),
            contentOnly({
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="IMAGE"]',
                onReadySelector: '[action="/admin/images/chooser/?select_format=true"]',
                hideSelectors: ['.show-transparency'],
            }),
            contentOnly({
                path: `/pages/${pageID}/edit/`,
                typeSelector: '[for="id_content"] + div .richtext',
                clickSelector: '[name="LINK"]',
                onReadySelector: '.page-results',
            }),
        ]

        richtext.push(pageRichText);
    });

    richtext = flatten(richtext);

    return {
        richtext,
    };
};

const generateStreamfields = () => {
    let streamfields = []

    PAGE_IDS.forEach(function (pageID) {
        const pageStreamField = [
        {
            label: `Streamfield - All blocks page ${pageID}`,
            path: `/pages/${pageID}/edit/`,
            clickSelector: [
                '#body-0-appendmenu .toggle',
                '#body-0-appendmenu .action-add-block-heading_block',
                '#body-0-appendmenu .toggle',
                '#body-0-appendmenu .action-add-block-image_block',
                '#body-0-appendmenu .toggle',
                '#body-0-appendmenu .action-add-block-block_quote',
                '#body-0-appendmenu .toggle',
                '#body-0-appendmenu .action-add-block-embed_block',
            ],
            selectors: ['.stream-field'],
        },
        {
            label: `Streamfield - Move blocks page ${pageID}`,
            path: `/pages/${pageID}/edit/`,
            clickSelector: [
                '#body-0-appendmenu .toggle',
                '#body-0-appendmenu .action-add-block-heading_block',
                '#body-0-appendmenu .toggle',
                '#body-0-appendmenu .action-add-block-image_block',
                '#body-0-movedown',
                '#body-9-delete',
            ],
            selectors: ['.stream-field'],
        },
    ];
        streamfields.push(pageStreamField);
    });

    streamfields = flatten(streamfields);

    return {
        streamfields,
    };
}

const modeladmin = [
    contentOnly({ path: '/base/people/' }),
    contentOnly({ path: '/base/people/edit/1/' }),
    contentOnly({ path: '/base/people/delete/1/' }),
    contentOnly({ path: '/base/people/create/' }),
];

const images = [
    contentOnly({ path: '/images/', hideSelectors: ['.show-transparency'] }),
    contentOnly({ path: '/images/?q=bread' }),
    contentOnly({ path: '/images/?collection_id=2' }),
    contentOnly({ path: '/images/47/' }),
    contentOnly({ path: '/images/47/delete/' }),
    contentOnly({ path: '/images/add/' }),
];

const documents = [
    contentOnly({ path: '/documents/' }),
    contentOnly({ path: '/documents/?collection_id=2' }),
    // TODO Missing existing document edit / delete views.
    contentOnly({ path: '/documents/multiple/add/' }),
];

const snippets = [
    contentOnly({ path: '/snippets/' }),
    contentOnly({ path: '/snippets/base/people/' }),
    contentOnly({ path: '/snippets/base/people/1/' }),
    contentOnly({ path: '/snippets/base/people/1/delete/' }),
    contentOnly({ path: '/snippets/base/people/add/' }),
];

const forms = [
    contentOnly({ path: '/forms/' }),
    contentOnly({ path: '/forms/submissions/69/' }),
    // TODO Point to a specific, stable date.
    // contentOnly({
    //     path: '/forms/submissions/69/',
    //     clickSelector: '[for="id_date_to"]',
    // }),
    contentOnly({
        path:
            '/forms/submissions/69/?date_from=2017-01-01&date_to=2050-01-01&action=filter',
        clickSelector: [
            '[for="id_date_to"]',
            '[data-date="9"][data-month="0"][data-year="2050"]',
        ],
    }),
    contentOnly({
        path: '/forms/submissions/69/',
        clickSelector: '[name="selected-submissions"]',
    }),
];

const settings = [
    contentOnly({ path: '/users/' }),
    contentOnly({ path: '/users/3/' }),
    contentOnly({ path: '/users/add/' }),
    contentOnly({
        path: '/users/add/',
        clickSelector: ['[href*="roles"]', '[for="id_groups_1"]'],
    }),
    contentOnly({
        path: '/users/?q=admin',
    }),
    contentOnly({ path: '/groups/' }),
    contentOnly({ path: '/groups/?q=edi' }),
    contentOnly({ path: '/groups/1/' }),
    contentOnly({
        path: '/groups/1/',
        clickSelector: [
            '#id_page_permissions-ADD',
            '#id_document_permissions-ADD',
            '#id_image_permissions-ADD',
        ],
    }),
    contentOnly({
        path: '/groups/1/',
        clickSelector: [
            '#id_page_permissions-0-DELETE-button',
            '#id_document_permissions-0-DELETE-button',
            '#id_image_permissions-0-DELETE-button',
        ],
    }),
    contentOnly({ path: '/groups/1/delete/' }),
    contentOnly({ path: '/groups/new/' }),
    contentOnly({ path: '/sites/' }),
    contentOnly({ path: '/sites/2/' }),
    contentOnly({ path: '/sites/2/delete/' }),
    contentOnly({ path: '/sites/new/' }),
    contentOnly({ path: '/collections/' }),
    contentOnly({ path: '/collections/2/' }),
    contentOnly({
        path: '/collections/2/',
        // TODO Privacy type click not always working
        // clickSelector: ['.action-set-privacy', '[for="id_restriction_type_3"]'],
        clickSelector: ['.action-set-privacy'],
    }),
    contentOnly({ path: '/collections/2/delete/' }),
    contentOnly({ path: '/collections/add/' }),
    contentOnly({ path: '/redirects/' }),
    contentOnly({ path: '/redirects/?q=test' }),
    // TODO Missing existing redirect edit / delete views.
    contentOnly({ path: '/redirects/add/' }),
    contentOnly({ path: '/searchpicks/' }),
    contentOnly({ path: '/searchpicks/?q=test' }),
    // TODO Missing existing searchpick edit / delete views.
    contentOnly({ path: '/searchpicks/add/' }),
    contentOnly({
        path: '/searchpicks/add/',
        clickSelector: '#id_query_string-chooser',
        onReadySelector: '[action="/admin/search/queries/chooser/results/"]',
    }),
];

const account = [
    contentOnly({ path: '/account/' }),
    contentOnly({ path: '/account/change_password/' }),
    contentOnly({ path: '/account/notification_preferences/' }),
    contentOnly({ path: '/account/language_preferences/' }),
    { path: '/password_reset/' },
];

const allPages = generatePages()['pages'];
const allRichText = generateRichText()['richtext'];
const allStreamFields = generateStreamfields()['streamfields'];

const scenarios = [
    ...empty,
    ...allPages,
    ...base,
    ...nav,
    ...images,
    ...documents,
    ...forms,
    ...settings,
    ...account,
];

// These can be moved into scenarios as seen fit
const otherScenarios = [
    ...allRichText,
    ...allStreamFields,
    ...modeladmin,
    ...snippets,
]

module.exports = scenarios.map(generateScenario);
