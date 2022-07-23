





**Methods**

<a href="#closedatabases">closeDatabases</a>, <a href="#opendatabases">openDatabases</a>, <a href="#ipinfo">ipInfo</a>






**Types**

<a href="#ipinfo">IPInfo</a>


<hr />

<strong id="closedatabases"><code>method</code>  closeDatabases</strong>



<p>

Closes databases

</p>

<details>
<summary>
<code>(): Promise&lt;void&gt;</code>
</summary><br />





<strong>Returns</strong>: <code>Promise&lt;void&gt;</code> 

<br />
</details>






<hr />

<strong id="opendatabases"><code>method</code>  openDatabases</strong>



<p>

Loads/initializes databases. If there is no database present in cache, updateCache will be ignored in order to initialize the databases.

</p>

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



<p>

Returns information about the IP

</p>

<details>
<summary>
<code>(ip: string): <a href="#ipinfo">IPInfo</a> & {
    success: boolean;
}</code>
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

<strong>Returns</strong>: <code><a href="#ipinfo">IPInfo</a> & {     success: boolean; }</code> IPInfo - When success is false, all values are filled with placeholders.

<br />
</details>






<hr />

<strong id="ipinfo"><code>type</code>  IPInfo</strong>





<pre></pre>


