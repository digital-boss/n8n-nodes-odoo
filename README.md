# n8n-nodes-odoo

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This Odoo custom node is created from a [pull request](https://github.com/n8n-io/n8n/pull/2601) to n8n.

# If you have n8n installed: Install custom nodes module

Install it to the n8n root folder. This is the node_modules folder on the same level of n8n and n8n-core. This differs when you used the -g flag on n8n initial installation. From there do:
```
npm install @digital-boss/n8n-nodes-odoo
```

# IFresh install n8n

Navigate to desired folder, create a package json and install n8n like so:
```
cd /var/www/vhosts/

mkdir my-n8n && cd my-n8n

npm init --yes

npm install n8n

npm install @digital-boss/n8n-nodes-odoo
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
