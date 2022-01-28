# n8n-nodes-odoo

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

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

[comment]: <> (# Latest functionality)

[comment]: <> (# Contribution)

[comment]: <> (To make this node even better, please let us know, [how you use it]&#40;mailto:info@digital-north-consulting.com&#41;. Commits are always welcome. )

[comment]: <> (# Issues)

[comment]: <> (If you have any issues, please [let us know on GitHub]&#40;https://github.com/digital-boss/n8n-nodes-odoo/issues&#41;.)

[comment]: <> (# About)

[comment]: <> (Special thanks to [N8n nodemation]&#40;https://n8n.io&#41; workflow automation by Jan Oberhauser.)

[comment]: <> (Nodes by [digital-north-consulting.com]&#40;https://digital-north-consulting.com&#41;. For productive use and consulting on this, [contact us please]&#40;mailto:info@digital-north-consulting.com&#41;.)

[comment]: <> (This node was updated with ❤️ by Valentina Lilova [valentina98]&#40;https://github.com/valentina98&#41;)
