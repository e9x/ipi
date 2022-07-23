





**Methods**

<a href="#loadasnv4">loadASNv4</a>, <a href="#loadasnv6">loadASNv6</a>, <a href="#loaddump">loadDump</a>, <a href="#loaddatabases">loadDatabases</a>, <a href="#ipinfo">ipInfo</a>






**Types**

<a href="#ipinfo">IPInfo</a>


<hr />

<strong id="loadasnv4"><code>method</code>  loadASNv4</strong>





<details>
<summary>
<code>(updateCache?: boolean): Promise&lt;void&gt;</code>
</summary><br />



<strong>Params</strong>

<table>
    <thead>
        <th align="left">Name</th>
        <th align="left">Type</th>
        <th align="center">Optional</th>
        <th align="left">Description</th>
    </thead>
    <tbody>
        <tr>
            <td>updateCache</td>
            <td><code>boolean</code></td>
            <td align="center">✓</td>
            <td></td>
        </tr>
    </tbody>
</table>

<strong>Returns</strong>: <code>Promise&lt;void&gt;</code> 

<br />
</details>






<hr />

<strong id="loadasnv6"><code>method</code>  loadASNv6</strong>





<details>
<summary>
<code>(updateCache?: boolean): Promise&lt;void&gt;</code>
</summary><br />



<strong>Params</strong>

<table>
    <thead>
        <th align="left">Name</th>
        <th align="left">Type</th>
        <th align="center">Optional</th>
        <th align="left">Description</th>
    </thead>
    <tbody>
        <tr>
            <td>updateCache</td>
            <td><code>boolean</code></td>
            <td align="center">✓</td>
            <td></td>
        </tr>
    </tbody>
</table>

<strong>Returns</strong>: <code>Promise&lt;void&gt;</code> 

<br />
</details>






<hr />

<strong id="loaddump"><code>method</code>  loadDump</strong>





<details>
<summary>
<code>(updateCache?: boolean): Promise&lt;void&gt;</code>
</summary><br />



<strong>Params</strong>

<table>
    <thead>
        <th align="left">Name</th>
        <th align="left">Type</th>
        <th align="center">Optional</th>
        <th align="left">Description</th>
    </thead>
    <tbody>
        <tr>
            <td>updateCache</td>
            <td><code>boolean</code></td>
            <td align="center">✓</td>
            <td></td>
        </tr>
    </tbody>
</table>

<strong>Returns</strong>: <code>Promise&lt;void&gt;</code> 

<br />
</details>






<hr />

<strong id="loaddatabases"><code>method</code>  loadDatabases</strong>





<details>
<summary>
<code>(updateCache?: boolean): Promise&lt;void&gt;</code>
</summary><br />



<strong>Params</strong>

<table>
    <thead>
        <th align="left">Name</th>
        <th align="left">Type</th>
        <th align="center">Optional</th>
        <th align="left">Description</th>
    </thead>
    <tbody>
        <tr>
            <td>updateCache</td>
            <td><code>boolean</code></td>
            <td align="center">✓</td>
            <td></td>
        </tr>
    </tbody>
</table>

<strong>Returns</strong>: <code>Promise&lt;void&gt;</code> 

<br />
</details>






<hr />

<strong id="ipinfo"><code>method</code>  ipInfo</strong>





<details>
<summary>
<code>(ip: string): Promise&lt;<a href="#ipinfo">IPInfo</a> & {
    success: boolean;
}&gt;</code>
</summary><br />



<strong>Params</strong>

<table>
    <thead>
        <th align="left">Name</th>
        <th align="left">Type</th>
        <th align="center">Optional</th>
        <th align="left">Description</th>
    </thead>
    <tbody>
        <tr>
            <td>ip</td>
            <td><code>string</code></td>
            <td align="center"></td>
            <td>IP address</td>
        </tr>
    </tbody>
</table>

<strong>Returns</strong>: <code>Promise&lt;<a href="#ipinfo">IPInfo</a> & {     success: boolean; }&gt;</code> IPInfo - When success is false, all values are filled with placeholders.

<br />
</details>






<hr />

<strong id="ipinfo"><code>type</code>  IPInfo</strong>





<pre></pre>


