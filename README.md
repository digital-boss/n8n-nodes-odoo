# n8n-nodes-flectra

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This Flectra custom node is a fork of [n8n-node-odoo](https://github.com/digital-boss/n8n-nodes-odoo) with additional workflow arguments.

# If you have n8n installed: Install custom nodes module

Install it to the n8n root folder. This is the node_modules folder on the same level of n8n and n8n-core. This differs when you used the -g flag on n8n initial installation. From there do:

```
npm install n8n-nodes-flectra
```

# IFresh install n8n

Navigate to desired folder, create a package json and install n8n like so:

```
cd /var/www/vhosts/

mkdir my-n8n && cd my-n8n

npm init --yes

npm install n8n

npm install n8n-nodes-flectra
```

# Start n8n

Directly:

```
n8n
```

Plesk or C-Panel:

```
node /var/www/vhosts/n8n/bin/n8n
```

# License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
