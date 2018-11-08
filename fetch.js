const fetchJSON = url => fetch(url).then(r => r.json());

function fetchContributors(onFetch, onError) {
    const orgUser = "Shen-Language";
    const apiUrl = "https://api.github.com";
    const orgReposUrl = `${apiUrl}/orgs/${orgUser}/repos`;
    const contribApiUrl = repo => `${apiUrl}/repos/${repo.full_name}/stats/contributors`;
    const profileApiUrl = login => `${apiUrl}/users/${login}`;

    const maintainers = ports
        .map(p => p.github)
        .filter(p => p !== undefined && p !== null)
        .map(g => g.beforeLastSlash())
        .filter(m => m !== orgUser);

    fetchJSON(orgReposUrl)
        .then(repos => repos
            .map(contribApiUrl)
            .map(url => fetchJSON(url).then(committers => committers
                .map(c => c.author.login))))
        .concat()
        .then(logins => logins
            .concat(maintainers)
            .flatten()
            .distinct()
            .map(profileApiUrl)
            .map(url => fetchJSON(url).then(users => users
                .map(({ login, name, blog }) => ({ github: login, name, blog })))))
        .concat()
        .then(onFetch)
        .catch(onError);
}

function getContributors(onFetch, onError) {
    const key = "contributors";
    const cached = localStorage.getItem(key);

    if (cached) {
        const { timestamp, contributors } = JSON.parse(cached);
        const [amount, unit] = timeout;
        if (moment().isBefore(moment(timestamp).add(amount, unit))) {
            onFetch(contributors);
            return;
        }
    }

    fetchContributors(
        contributors => {
            const cached = { timestamp: moment(), contributors };
            localStorage.setItem(key, JSON.stringify(cached));
            onFetch(contributors);
        },
        onError);
}
