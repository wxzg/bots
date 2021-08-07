# bots

## 启动

`npm i or cnpm i or yarn add`

`npm start`

## **模块使用介绍**

### 1.knex

写SQL查询语句的，就是SQL查询构建器，需要安装该knex库，然后安装适当的数据库库：**pg适用于PostgreSQL**和Amazon Redshift，mysql适用于MySQL或MariaDB，sqlite3适用于SQLite3或mssql适用于MSSQL。英文文档：https://knexjs.org/

```javascript
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './data.db',
  },
});

try {

  // Create a table
  await knex.schema
    .createTable('users', table => {
      table.increments('id');
      table.string('user_name');
    })
    // ...and another
    .createTable('accounts', table => {
      table.increments('id');
      table.string('account_name');
      table
        .integer('user_id')
        .unsigned()
        .references('users.id');
    })

  // Then query the table...
  const insertedRows = await knex('users').insert({ user_name: 'Tim' })

  // ...and using the insert id, insert into the other table.
  await knex('accounts').insert({ account_name: 'knex', user_id: insertedRows[0] })

  // Query both of the rows.
  const selectedRows = await knex('users')
    .join('accounts', 'users.id', 'accounts.user_id')
    .select('users.user_name as user', 'accounts.account_name as account')

  // map over the results
  const enrichedRows = selectedRows.map(row => ({ ...row, active: true }))

  // Finally, add a catch statement
} catch(e) {
  console.error(e);
};
```

### 2.pg

即node-postgres模块，使用pg模块操作postgres数据库，英文文档：https://node-postgres.com/

```javascript
const pg = require('pg')

// 数据库配置
var config = {
    user: "wenbin.ouyang",
    host: 'localhost',
    database: "test",
    password: "",
    port: 5432,

    // 扩展属性
    max: 20, // 连接池最大连接数
    idleTimeoutMillis: 3000, // 连接最大空闲时间 3s
}

// 创建连接池
var pool = new pg.Pool(config);

// 查询
pool.connect(function (err, client, done) {
    if (err) {
        return console.error('数据库连接出错', err);
    }
    // 简单输出个 Hello World
    client.query('SELECT $1::varchar AS OUT', ["Hello World"], function (err, result) {
        done();// 释放连接（将其返回给连接池）
        if (err) {
            return console.error('查询出错', err);
        }
        console.log(result.rows[0].out); //output: Hello World
    });
});

pool.connect().then(client => {
    // insert 数据
    client.query("INSERT INTO student(name, age) VALUES($1::varchar, $2::int)", ["xiaoming", "20"]).then(res => {
        console.log("Insert Success")
        // 如果是自增ID，有返回值的，在res里
        return res;
    })
        .then(res => {
            // 查询xiaoming
            return client.query("Select * FROM student WHERE name = $1", ["xiaoming"]);
        })
        .then(res => {
            // 输出结果，看是否插入成功
            console.log(res.rows[0]) // { id: 4, name: 'xiaoming', age: 20 }
            console.log(res.rows.length)
        })
        .then(res => {
            // update 数据，将age改为21
            return client.query("UPDATE student SET age=$1 WHERE name=$2", [21, "xiaoming"])
        })
        .then(res => {
            // 再查询一次xiaoming
            return client.query("Select * FROM student WHERE name = $1", ["xiaoming"]);
        })
        .then(res => {
            // 再输出结果，看是否改为了21
            console.log(res.rows[0])
            console.log(res.rows.length)
        })
        .then(res => {
            // 删除数据
            client.query("DELETE FROM student WHERE name=$1", ["xiaoming"])
        })
        .then(res => {
            // 最后再查询一次xiaoming
            res = client.query("Select * FROM student WHERE name = $1", ["xiaoming"]);
            // 释放连接
            client.release()
            return res
        })
        .then(res => {
            // 再输出结果，没数据 undefined
            console.log(res.rows[0]) // undefined
            console.log(res.rows.length) // 0
        })
})
```

### 3.页面监听 monitor

通过一定的时间间隔来不间断的请求目标页面，通过比较前后两次页面内容来确定是否发生变化完成监听

```javascript
const request = require('request-promise')
const cheerio = require('cheerio')

async function check() {
    const options = {
        url: 'https://notify.express',
        method: 'GET'
    }


    return request(options).then(response => {
        const $     = cheerio.load(response)
        const title = $("title").text()
        return title
    }).catch(error => {
        console.log(`Error! We received a bad response code or what could be a more serious error (No internet, bad proxy etc)`)
        console.log(`Error message: ${error.message}`)
        return
    })
}

function findChange() {
    let last_title = false

    setInterval(async function() {
        let latest_title = await check()

        if (latest_title && latest_title != last_title) {
            if (!last_title) {
                console.log("This is the first iteration. Finding what the title is.")
            } else {
                // We could do something cool in here like send a discord webhook or move onto the next stage of our bot
                console.log(`The title of the webpage has changed, it's now: "${latest_title}"`)
            }
        } else if (last_title == latest_title) {
            console.log(`The title of the webpage is still the same. No change has been detected. it's still: "${latest_title}"`)
        } else {
            return console.log("There was probably a server error! Not updating the title.")
        }

        // Redefining the variable as the most up-to-date title everytime except where we don't want to
        last_title = latest_title
    }, 1500)
}

findChange()
```

## 4.puppeteer

### 4.1  Page

- **page.$$eval** 相当于 Array.from(document.querySelectorAll(selector)) 返回所有选中元素的数组，并可在回调函数中进行处理

```javascript
const divCount = await page.$$eval('div', divs => divs.length);
```



- 


