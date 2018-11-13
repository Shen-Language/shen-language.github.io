async function fetchContributors() {
  const orgUser = "Shen-Language";
  const apiUrl = "https://api.github.com";
  const orgReposUrl = `${apiUrl}/orgs/${orgUser}/repos`;
  const repoContribsUrl = repo => `${apiUrl}/repos/${repo.full_name}/stats/contributors`;
  const profileUrl = login => `${apiUrl}/users/${login}`;
  const fetchJSON = url => fetch(url).then(r => r.json());
  const repos = await fetchJSON(orgReposUrl);
  const contributorLists = await repos
    .map(repoContribsUrl)
    .map(fetchJSON)
    .awaitAll();
  const maintainers = ports
    .map(p => p.github)
    .sift()
    .map(beforeLastSlash)
    .filter(m => m !== orgUser);
  const profiles = await contributorLists
    .flatten()
    .map(c => c.author.login)
    .concat(maintainers)
    .distinct()
    .map(profileUrl)
    .map(fetchJSON)
    .awaitAll();
  return profiles
    .sift()
    .map(({ login, name, blog }) => ({ github: login, name, blog }));
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

  fetchContributors()
    .then(contributors => {
      const cached = { timestamp: moment(), contributors };
      localStorage.setItem(key, JSON.stringify(cached));
      onFetch(contributors);
    })
    .catch(onError);
}
